type University = {
  id: string | number;
  name: string;
  slug: string;
  country: string;
  popular: boolean;
};

type HomePageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = rawQuery?.trim() ?? "";

  const endpoint = query
    ? `/api/search?q=${encodeURIComponent(query)}`
    : "/api/universities";

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  const universities = (await response.json()) as University[];

  return (
    <main>
      <h1>院校搜索</h1>

      <form action="/" method="get">
        <label htmlFor="search">院校名称或国家</label>
        <br />
        <input
          id="search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="例如：Malaysia"
        />
        <button type="submit">搜索</button>
      </form>

      <h2>{query ? `“${query}”的搜索结果` : "全部院校"}</h2>

      {universities.length === 0 ? (
        <p>没有找到符合条件的院校。</p>
      ) : (
        <ul>
          {universities.map((university) => (
            <li key={university.id}>
              <strong>{university.name}</strong>
              {" — "}
              {university.country}
              {university.popular ? "（热门）" : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}