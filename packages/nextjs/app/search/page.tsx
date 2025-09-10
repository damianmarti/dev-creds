import { Search } from "~~/components/search/Search";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-base-300">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Developer Search</h1>
          <p className="text-lg text-base-content/70">Search for developers by their GitHub username</p>
        </div>
        <Search />
      </div>
    </div>
  );
}
