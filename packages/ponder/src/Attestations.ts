import { ponder } from "ponder:registry";
import { attestation, developer, developerSkill } from "ponder:schema";
import scaffoldConfig from "../../nextjs/scaffold.config";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { EAS_ABI } from "../../nextjs/contracts/externalContracts";
import { createClient } from "redis";

const redis = await createClient({ url: process.env.REDIS_URL }).connect();

const targetNetwork = scaffoldConfig.targetNetworks[0];
const easConfig = scaffoldConfig.easConfig[targetNetwork.id];

ponder.on("EAS:Attested", async ({ event, context }) => {
    const { client } = context;

    if (event.args.schema === easConfig.schemaUID) {
        const attestationInfo = await client.readContract({
            address: easConfig.contractAddress,
            abi: EAS_ABI,
            functionName: "getAttestation",
            args: [event.args.uid],
        });

        const schemaEncoder = new SchemaEncoder("string github_user,string[] skills,string description,string[] evidences");
        const decodedData = schemaEncoder.decodeData(attestationInfo.data);

        if (decodedData && decodedData[0] && decodedData[1] && decodedData[2] && decodedData[3]) {

            const githubUser = decodedData[0].value.value.toString().toLowerCase();
            const skills = decodedData[1].value.value.toString().split(',');
            const description = decodedData[2].value.value.toString();
            const evidences = decodedData[3].value.value.toString().split(',').filter(e => e.trim());
            const attester = event.args.attester.toLowerCase();

            const evidencesData: Record<string, { verified_count: number, collaborator_count: number }> = {};

            skills.forEach((skill) => {
                evidencesData[skill.toLowerCase()] = {
                    verified_count: 0,
                    collaborator_count: 0,
                };
            });

            const evidencesVerified: boolean[] = [];
            const evidencesCollaborator: boolean[] = [];

            if (evidences.length > 0) {
                const attesterUsername = await redis.get(`github:byAddress:${attester}`);
                for (const evidence of evidences) {
                    let evidenceIsVerified = false;
                    let evidenceIsCollaborator = false;
                    if (evidence.startsWith("https://github.com/") || evidence.startsWith("github.com/")) {
                        try {
                            let evidenceUrl = evidence;
                            if (evidence.startsWith("github.com/")) {
                                evidenceUrl = evidence.replace("github.com/", "https://github.com/");
                            }
                             const user = evidenceUrl.split("/")[3];
                             const repository = evidenceUrl.split("/")[4];
                             const headers: Record<string, string> = {};
                             if (process.env.GITHUB_TOKEN) {
                                 headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
                             }
                             const response = await fetch(`https://api.github.com/repos/${user}/${repository}/contributors`, { headers });
                             const data = await response.json();

                            if (data && Array.isArray(data) && data.length > 0) {
                                const contributors = data.map((contributor: any) => contributor.login.toLowerCase());
                                if (contributors.includes(githubUser)) {
                                    const isCollaborator = attesterUsername && contributors.some((contributor: string) => contributor === attesterUsername.toLowerCase());
                                    if (isCollaborator) {
                                        evidenceIsCollaborator = true;
                                        skills.forEach((skill) => {
                                            const skillData = evidencesData[skill.toLowerCase()];
                                            if (skillData) {
                                                skillData.collaborator_count += 1;
                                            }
                                        });
                                    }
                                    const responseLanguages = await fetch(`https://api.github.com/repos/${user}/${repository}/languages`, { headers });
                                    const languagesData = await responseLanguages.json();
                                    const languages = Object.keys(languagesData as Record<string, any>);
                                    languages.forEach(async (language) => {
                                        const languageLower = language.toLowerCase();
                                        if (evidencesData[languageLower]) {
                                            evidenceIsVerified = true;
                                            evidencesData[languageLower].verified_count += 1;
                                        }
                                    });
                                }
                            }
                        } catch (error) {
                            console.error(`Error fetching evidence: ${evidence}`, error);
                        }
                    }
                    evidencesVerified.push(evidenceIsVerified);
                    evidencesCollaborator.push(evidenceIsCollaborator);
                }
            }

            await context.db.insert(attestation).values({
                id: event.log.id,
                attester: attester,
                uid: event.args.uid,
                githubUser: githubUser,
                skills: skills,
                description: description,
                evidences: evidences,
                evidencesVerified: evidencesVerified,
                evidencesCollaborator: evidencesCollaborator,
                timestamp: Number(event.block.timestamp),
            });

            await context.db.insert(developer).values({
                githubUser: githubUser,
            }).onConflictDoNothing();

            for (let i = 0; i < skills.length; i++) {
                const skill = skills[i];
                if (!skill) {
                    continue;
                }
                const evidenceData = evidencesData[skill.toLowerCase()];
                let verifiedCount = 0;
                let collaboratorCount = 0;
                if (evidenceData) {
                    verifiedCount = evidenceData.verified_count > 0 ? 1 : 0;
                    collaboratorCount = evidenceData.collaborator_count > 0 ? 1 : 0;
                }
                await context.db.insert(developerSkill).values({
                    githubUser: githubUser,
                    skill: skill,
                    count: 1,
                    verifiedCount: verifiedCount,
                    collaboratorCount: collaboratorCount,
                    score: 1 + verifiedCount + collaboratorCount,
                }).onConflictDoUpdate((row) => ({
                    count: row.count + 1,
                    verifiedCount: row.verifiedCount + verifiedCount,
                    collaboratorCount: row.collaboratorCount + collaboratorCount,
                    score: row.score + 1 + verifiedCount + collaboratorCount,
                  }));
            }
        }
    }
});
