import { ponder } from "ponder:registry";
import { attestation, developer, developerSkill } from "ponder:schema";
import scaffoldConfig from "../../nextjs/scaffold.config";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { EAS_ABI } from "../../nextjs/contracts/externalContracts";

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
            const evidences = decodedData[3].value.value.toString().split(',');

            // Create a new Attestation
            await context.db.insert(attestation).values({
                id: event.log.id,
                attester: event.args.attester,
                uid: event.args.uid,
                githubUser: githubUser,
                skills: skills,
                description: description,
                evidences: evidences,
                timestamp: Number(event.block.timestamp),
            });

            await context.db.insert(developer).values({
                githubUser: githubUser,
            }).onConflictDoNothing();

            skills.forEach(async (skill) => {
                // TODO: change score based on evidences
                await context.db.insert(developerSkill).values({
                    githubUser: githubUser,
                    skill: skill,
                    count: 1,
                    score: 1,
                }).onConflictDoUpdate((row) => ({
                    count: row.count + 1,
                    score: row.score + 1
                  }));
            });
        }
    }
});
