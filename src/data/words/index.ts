import type { CategoryId } from "../game-categories"
import type {
  WordsByCategory,
  SimilarPairsByCategory,
  SimilarPair,
} from "./types"

import foodWords from "./food.words.json"
import foodPairs from "./food.pairs.json"
import moviesWords from "./movies.words.json"
import moviesPairs from "./movies.pairs.json"
import objectsWords from "./objects.words.json"
import objectsPairs from "./objects.pairs.json"
import argFutbol78Words from "./arg_futbol_78.words.json"
import argFutbol78Pairs from "./arg_futbol_78.pairs.json"
import technologyWords from "./technology.words.json"
import technologyPairs from "./technology.pairs.json"
import placesWords from "./places.words.json"
import placesPairs from "./places.pairs.json"
import animeWords from "./anime.words.json"
import animePairs from "./anime.pairs.json"
import argentinaThingsWords from "./argentina_things.words.json"
import argentinaThingsPairs from "./argentina_things.pairs.json"

export const WORDS_BY_CATEGORY: WordsByCategory = {
  food: foodWords as readonly string[],
  movies: moviesWords as readonly string[],
  objects: objectsWords as readonly string[],
  arg_futbol_78: argFutbol78Words as readonly string[],
  technology: technologyWords as readonly string[],
  places: placesWords as readonly string[],
  anime: animeWords as readonly string[],
  argentina_things: argentinaThingsWords as readonly string[],
} as const

export const SIMILAR_PAIRS_BY_CATEGORY: SimilarPairsByCategory = {
  food: foodPairs as readonly SimilarPair[],
  movies: moviesPairs as readonly SimilarPair[],
  objects: objectsPairs as readonly SimilarPair[],
  arg_futbol_78: argFutbol78Pairs as readonly SimilarPair[],
  technology: technologyPairs as readonly SimilarPair[],
  places: placesPairs as readonly SimilarPair[],
  anime: animePairs as readonly SimilarPair[],
  argentina_things: argentinaThingsPairs as readonly SimilarPair[],
} as const

export type {
  SimilarPair,
  WordsByCategory,
  SimilarPairsByCategory,
} from "./types"
