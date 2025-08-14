import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { Address } from "~~/components/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";

// const graphUri = "https://optimism.easscan.org/graphql";
const graphUri = "https://optimism-sepolia.easscan.org/graphql";

type Attestation = {
  id: string;
  attester: string;
  data: string;
  timeCreated: number;
};
type AttestationsData = { attestations: Attestation[] };

const fetchAttestations = async () => {
  const AttestationsQuery = gql`
    query Attestations {
      attestations(
        where: { schemaId: { equals: "0x5fe4eaf3dd73bc3c6929505faacc81ba5cfd50566b6bc34617ae069a5415dbf9" } }
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
  const schemaEncoder = new SchemaEncoder("string github_user,string[] skills,string description,string evidence");

  const { data: attestationsData, isLoading } = useQuery({
    queryKey: ["attestations"],
    queryFn: fetchAttestations,
    refetchInterval: scaffoldConfig.pollingInterval,
  });

  console.log("attestationsData: ", attestationsData);

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
                        href={`https://optimism-sepolia.easscan.org/attestation/view/${attestation.id}`}
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
                    <td>{schemaEncoder.decodeData(attestation.data)[1].value.value.toString()}</td>
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
