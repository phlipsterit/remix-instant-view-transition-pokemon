import { LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node";
import {
  ClientLoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { clientLoaderContext } from "~/clientLoaderContext";
import { LinkAndImageTransition } from "~/components/LinkAndImageTransition";
import { getPokemonInfo } from "~/pokemon";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const pokemon = await getPokemonInfo(params.pokemon!, 500);

  return json({ pokemon });
};

export const clientLoader = async ({
  serverLoader,
  params,
}: ClientLoaderFunctionArgs) => {
  const key = `pokemon_info_${params.pokemon!}`;
  const pokemonInfo = clientLoaderContext.get(key);
  if (pokemonInfo) {
    clientLoaderContext.remove(key);
    return { pokemon: pokemonInfo };
  }
  return await serverLoader();
};

export default function Index() {
  const { pokemon } = useLoaderData<typeof loader>();
  const evolutions = pokemon?.evolutions ?? [];
  const url = useLocation().pathname;
  const isInfoPage = url.includes("info");

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="flex w-full justify-between h-64 border-b-gray-200 border-b">
        {evolutions.map((evolution) => {
          const sameName = evolution.name === pokemon?.name;
          const transitionTo =
            // if we're not on the info page and we're clicking the selected pokemon, go to the main page
            !isInfoPage && sameName
              ? "/"
              : sameName
              ? // If we're on info page and we're clicking the selected pokemon, go to the evolution page
                `/pokemon/${evolution.name}`
              : // Otherwise, go to the info page
                `/pokemon/${evolution.name}/info`;
          return (
            <LinkAndImageTransition
              key={evolution.name}
              to={transitionTo}
              onClick={() => {
                clientLoaderContext.set(`pokemon_info_${evolution.name}`, {
                  name: evolution.name,
                  image: evolution.image,
                  evolutions,
                });
                clientLoaderContext.set(
                  `pokemon_info_detailed_${evolution.name}`,
                  {
                    name: evolution.name,
                    image: evolution.image,
                    evolutions,
                  }
                );
              }}
              imgProps={{
                src: evolution.image,
                transitionName: evolution.name,
                className: sameName ? "opacity-100" : "opacity-50",
              }}
            />
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
