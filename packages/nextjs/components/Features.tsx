import { BoltIcon, CheckCircleIcon, StarIcon, UserGroupIcon } from "@heroicons/react/24/outline";

type FeatureItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const featureItems: FeatureItem[] = [
  {
    id: "context-attestations",
    title: "Context-Rich Attestations",
    description: "Every skill validation requires evidence — link PRs, projects, or contributions.",
    icon: CheckCircleIcon,
  },
  {
    id: "verified-collaborators",
    title: "Verified Collaborators",
    description: "Reviews from developers you’ve actually worked with carry “Collaborator” badges.",
    icon: UserGroupIcon,
  },
  {
    id: "arbitrum-powered",
    title: "Arbitrum Powered",
    description: "Fast, cheap, and permanent attestations using EAS on Arbitrum.",
    icon: BoltIcon,
  },
  {
    id: "portable-reputation",
    title: "Portable Reputation",
    description: "Your reputation is yours forever — take it anywhere in the Web3 ecosystem.",
    icon: StarIcon,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Why DevCreds?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Traditional endorsements are broken. DevCreds adds context, evidence, and onchain verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featureItems.map(featureItem => {
            const Icon = featureItem.icon;
            return (
              <div
                key={featureItem.id}
                className="card bg-base-100 border-2 hover:border-primary/20 transition-colors shadow"
              >
                <div className="card-body">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="card-title font-serif text-lg sm:text-xl">{featureItem.title}</h3>
                      <p className="text-sm text-muted-foreground">{featureItem.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
