import { useState } from "react";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useAccount } from "wagmi";
import { ArrowSmallRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { notification } from "~~/utils/scaffold-eth";
import { useSigner } from "~~/utils/useSigner";

export const Attest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [githubUser, setGithubUser] = useState("");
  const [skills, setSkills] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const { address } = useAccount();

  const signer = useSigner();

  const EASContractAddress = "0x4200000000000000000000000000000000000021";
  const eas = new EAS(EASContractAddress);

  const addSkill = () => {
    setSkills([...skills, ""]);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index: number, value: string) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = value;
    setSkills(updatedSkills);
  };

  const signAttestation = async () => {
    if (githubUser && address && signer) {
      setIsLoading(true);

      try {
        eas.connect(signer);

        const schemaEncoder = new SchemaEncoder(
          "string github_user,string[] skills,string description,string evidence",
        );
        const validSkills = skills.filter(skill => skill.trim());

        const encodedData = schemaEncoder.encodeData([
          { name: "github_user", value: githubUser, type: "string" },
          { name: "skills", value: validSkills, type: "string[]" },
          { name: "description", value: description, type: "string" },
          { name: "evidence", value: evidence, type: "string" },
        ]);

        const schemaUID = "0x5fe4eaf3dd73bc3c6929505faacc81ba5cfd50566b6bc34617ae069a5415dbf9";

        const tx = await eas.attest(
          {
            schema: schemaUID,
            data: {
              recipient: address,
              expirationTime: 0n,
              revocable: true,
              data: encodedData,
            },
          },
          {
            gasLimit: 3000000n,
          },
        );

        const newAttestationUID = await tx.wait();

        console.log("New attestation UID:", newAttestationUID);

        notification.success("Attestation signed successfully! UID: " + newAttestationUID);

        // Reset form
        setGithubUser("");
        setSkills([""]);
        setDescription("");
        setEvidence("");
      } catch (e) {
        console.log("Error signing attestation: ", e);
        notification.error("Error signing attestation: " + e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex bg-base-300 relative pb-10">
      <div className="flex flex-col w-full mx-5 sm:mx-8 2xl:mx-20">
        <div className="text-sm flex flex-col mt-6 px-7 py-8 bg-base-200 opacity-80 rounded-xl shadow-lg border-2 border-primary">
          <span className="text-l sm:text-4xl text-black">Attest Developer Skills</span>

          <div className="mt-8 space-y-6">
            {/* GitHub User */}
            <div className="flex flex-col gap-2">
              <div className="font-bold">GitHub Username:</div>
              <input
                type="text"
                value={githubUser}
                onChange={e => setGithubUser(e.target.value)}
                placeholder="Enter GitHub username"
                className="input input-bordered w-full"
              />
            </div>

            {/* Skills */}
            <div className="flex flex-col gap-2">
              <div className="font-bold">Skills:</div>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={skill}
                      onChange={e => updateSkill(index, e.target.value)}
                      placeholder="Enter a skill"
                      className="input input-bordered flex-1"
                    />
                    {skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="btn btn-sm btn-error btn-outline"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn btn-sm btn-primary btn-outline flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <div className="font-bold">Description:</div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the developer's experience and background"
                className="textarea textarea-bordered w-full h-24 rounded-xl"
                rows={4}
              />
            </div>

            {/* Evidence */}
            <div className="flex flex-col gap-2">
              <div className="font-bold">Evidence:</div>
              <input
                type="text"
                value={evidence}
                onChange={e => setEvidence(e.target.value)}
                placeholder="Link to portfolio, projects, or other evidence"
                className="input input-bordered w-full"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <div className="flex rounded-full border border-primary p-1 flex-shrink-0">
                <div className="flex rounded-full border-2 border-primary p-1">
                  <button
                    className={`btn btn-primary rounded-full capitalize font-normal font-white w-35 flex items-center gap-1 hover:gap-2 transition-all tracking-widest ${
                      isLoading ? "loading" : ""
                    }`}
                    disabled={isLoading || !githubUser || skills.every(skill => !skill.trim())}
                    onClick={async () => await signAttestation()}
                  >
                    {!isLoading && (
                      <>
                        Attest <ArrowSmallRightIcon className="w-3 h-3 mt-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
