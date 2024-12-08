import { LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import {
  ClientLoaderFunctionArgs,
  unstable_useViewTransitionState,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { useEffect } from "react";
import { clientLoaderContext } from "~/clientLoaderContext";
import { ImageWithTransition } from "~/components/ImageWithTransition";
import { getPokemonInfo } from "~/pokemon";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const pokemon = await getPokemonInfo(params.pokemon!, 500, true);

  return json({ pokemon });
};

export const clientLoader = async ({
  serverLoader,
  params,
}: ClientLoaderFunctionArgs) => {
  const key = `pokemon_info_detailed_${params.pokemon!}`;
  const pokemonInfo = clientLoaderContext.get(key);
  if (pokemonInfo) {
    clientLoaderContext.remove(key);
    return { pokemon: pokemonInfo };
  }
  return await serverLoader();
};

const usePartialLoaderData = () => {
  const loaderData = useLoaderData<typeof loader>();
  const { pokemon } = loaderData;
  const fetcher = useFetcher<typeof loader>({ key: loaderData.pokemon.name });

  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data && !pokemon?.type) {
      fetcher.load("/pokemon/" + pokemon.name + "/info");
    }
  }, [fetcher, pokemon.name, pokemon.type]);

  return fetcher.data || loaderData;
};

export default function Index() {
  const { pokemon } = usePartialLoaderData<typeof loader>();
  const isTransitioningToMain = unstable_useViewTransitionState(`/`);
  const isGoingBack = unstable_useViewTransitionState(
    `/pokemon/${pokemon?.name}`
  );

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <hr className="mt-8 mb-8" />
      <h1 className="text-4xl font-bold text-center">{pokemon?.name}</h1>
      <hr className="mt-8" />
      {!isTransitioningToMain && !isGoingBack && (
        <ImageWithTransition
          to={`/pokemon/${pokemon?.name}/info`}
          style={{
            height: "300px",
          }}
          transitionName={pokemon?.name}
          src={pokemon?.image!}
        />
      )}
      <p>Type:</p>
      <p> {pokemon.type || "..."}</p>
      <p>Height:</p>
      <p> {pokemon.height || "..."}</p>
    </div>
  );
}
