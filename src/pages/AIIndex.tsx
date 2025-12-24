import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ModelCard } from "@/components/ai-index/ModelCard";
import { useModels } from "@/hooks/useModels";
import { Search, Filter } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";

const providers = ["All", "OpenAI", "Anthropic", "Google DeepMind", "Meta", "Mistral AI", "xAI"];

export default function AIIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("All");

  const { data: models, isLoading } = useModels();

  const filteredModels = (models ?? []).filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvider =
      selectedProvider === "All" || model.provider === selectedProvider;

    return matchesSearch && matchesProvider;
  });

  const transformModel = (model: typeof filteredModels[0]) => ({
    slug: model.id,
    name: model.name,
    provider: model.provider,
    version: model.version,
    releaseDate: new Date(model.release_date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    description: model.description,
    parameters: model.parameters ?? undefined,
    contextWindow: model.context_window ?? undefined,
    pricing: model.pricing ?? undefined,
    category: model.category,
    benchmarks: model.benchmarks ?? undefined,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>AI Index — Cognitive Ledger</title>
        <meta
          name="description"
          content="A comprehensive reference tracking major AI models, their capabilities, benchmarks, version histories, and pricing. The authoritative public record."
        />
      </Helmet>

      <Layout>
        <div className="container py-8">
          {/* Header */}
          <header className="max-w-3xl mb-12">
            <span className="category-badge">Reference</span>
            <h1 className="headline-hero mt-3 mb-4">The AI Index</h1>
            <p className="text-xl text-body-text leading-relaxed">
              A comprehensive, continuously updated reference tracking major AI models, 
              their capabilities, benchmarks, and version histories. The authoritative 
              public record for artificial intelligence.
            </p>
          </header>

          {/* Filters */}
          <div className="border border-divider bg-secondary/30 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-caption" />
                <input
                  type="text"
                  placeholder="Search models, providers, or capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-divider bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Provider Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-caption" />
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="px-4 py-2.5 border border-divider bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-caption">
              Showing {filteredModels.length} of {models?.length ?? 0} models
            </p>
          </div>

          {/* Model Grid */}
          {filteredModels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {filteredModels.map((model) => (
                <ModelCard key={model.id} {...transformModel(model)} />
              ))}
            </div>
          ) : models && models.length === 0 ? (
            <div className="text-center py-16 border border-divider">
              <h3 className="headline-tertiary mb-2">No Models Yet</h3>
              <p className="text-body-text">
                AI models will be listed here once they are added to the index.
              </p>
            </div>
          ) : (
            <div className="text-center py-16 border border-divider">
              <h3 className="headline-tertiary mb-2">No models found</h3>
              <p className="text-body-text">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}

          {/* Methodology Note */}
          <section className="border-t border-divider pt-8 mt-8">
            <h2 className="headline-secondary mb-4">Methodology</h2>
            <div className="max-w-3xl text-body-text space-y-4">
              <p>
                The AI Index maintains records of major AI models based on publicly 
                available information from model providers, academic publications, 
                and verified third-party benchmarks.
              </p>
              <p>
                Benchmark scores are sourced from official provider documentation 
                or standardized evaluation frameworks. When multiple evaluation 
                methodologies exist, we prioritize the most widely-cited approach.
              </p>
              <p>
                Version histories are compiled from official announcements, API 
                documentation, and changelog publications. Pricing information 
                reflects the most recent publicly available rates.
              </p>
              <p className="text-caption text-sm italic">
                Last updated: {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}
