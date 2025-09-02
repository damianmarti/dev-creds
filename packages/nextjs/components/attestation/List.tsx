import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { Address } from "~~/components/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";

type Attestation = {
  id: string;
  attester: string;
  data: string;
  timeCreated: number;
};
type AttestationsData = { attestations: Attestation[] };

const fetchAttestations = async (graphUri: string, schemaUID: string) => {
  const AttestationsQuery = gql`
    query Attestations {
      attestations(
        where: { schemaId: { equals: "${schemaUID}" } }
      ) {
        attester
        data
        timeCreated
        id
      }
    }
  `;
  const data = await request<AttestationsData>(graphUri, AttestationsQuery);
  return data;
};

export const List = () => {
  const targetNetwork = scaffoldConfig.targetNetworks[0];
  const easConfig = scaffoldConfig.easConfig[targetNetwork.id];

  const schemaEncoder = new SchemaEncoder("string github_user,string[] skills,string description,string[] evidences");

  const { data: attestationsData, isLoading } = useQuery({
    queryKey: ["attestations", targetNetwork.id],
    queryFn: () => {
      if (!easConfig) {
        throw new Error("EAS configuration not found for this chain");
      }
      return fetchAttestations(easConfig.graphUri, easConfig.schemaUID);
    },
    refetchInterval: scaffoldConfig.pollingInterval,
    enabled: !!easConfig,
  });

  if (!easConfig) {
    return (
      <div className="list__container flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
        <div className="alert alert-warning">
          <div>
            <h3 className="font-bold">EAS Not Configured</h3>
            <div className="text-xs">EAS is not configured for this network. Please switch to a supported network.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="list__container flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <div className="flex justify-center">
        <table className="table table-zebra w-full shadow-lg">
          <thead>
            <tr>
              <th className="bg-primary text-white p-1.5 sml:p-4">UID</th>
              <th className="bg-primary text-white p-1.5 sml:p-4">Attester</th>
              <th className="bg-primary text-white p-1.5 sml:p-4">GitHub User</th>
              <th className="bg-primary text-white p-1.5 sml:p-4">Skills</th>
              <th className="bg-primary text-white p-1.5 sml:p-4">Attested at</th>
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              {[...Array(10)].map((_, rowIndex) => (
                <tr key={rowIndex} className="bg-base-200 hover:bg-base-300 transition-colors duration-200 h-12">
                  {[...Array(5)].map((_, colIndex) => (
                    <td className="w-1/4 p-1 sml:p-4" key={colIndex}>
                      <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              {attestationsData?.attestations.map(attestation => {
                return (
                  <tr key={attestation.id} className="hover text-sm">
                    <td className="w-1/4 p-1 sml:p-4">
                      <a
                        href={`${easConfig?.scan}/attestation/view/${attestation.id}`}
                        title={attestation.id}
                        target="_blank"
                        rel="noreferrer"
                        className="flex"
                      >
                        <span className="list__container--first_row-data">{attestation.id.slice(0, 20)}</span>...
                      </a>
                    </td>
                    <td className="w-1/4 p-1 sml:p-4">
                      <Address address={attestation.attester} size="sm" />
                    </td>
                    <td className="w-1/4 p-1 sml:p-4">
                      {schemaEncoder.decodeData(attestation.data)[0].value.value.toString()}
                    </td>
                    <td className="w-1/4 p-1 sml:p-4">
                      <div className="flex flex-wrap gap-1">
                        {schemaEncoder
                          .decodeData(attestation.data)[1]
                          .value.value.toString()
                          .split(",")
                          .map((skill: string, index: number) => (
                            <span key={index} className="badge badge-primary badge-sm">
                              {skill.trim()}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="text-right list__container--last_row-data p-1 sml:p-4">
                      {new Date(attestation.timeCreated * 1000).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};
