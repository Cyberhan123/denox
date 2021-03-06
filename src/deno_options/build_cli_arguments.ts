import { DenoOptionsEntries, DenoOptionValue } from "../interfaces.ts";
import { getOptionType, OptionTypeValues } from "./utils.ts";
import { optionsDefinitions } from "./const.ts";
import { type } from "os";

type CLIArgument = string | number | [string, number];
type hashCliArgType = { name: string; value: string | boolean | number };

function buildDenoCLIOptionsArgs(
  denoOptions: DenoOptionsEntries,
): CLIArgument[] {
  const argumentsOptions: CLIArgument[] = [];

  for (const [option, value] of Object.entries(denoOptions)) {
    const argumentOption = _transformToCLIArguments(option, value);
    argumentsOptions.push(argumentOption);
  }

  return argumentsOptions.filter((e) => e).flat(Infinity);
}

function _hashToCLIArg(
  hash: hashCliArgType,
): CLIArgument {
  if (hash.value === false) {
    return "";
  }

  const cliArgOptionName = `--${hash.name}`;
  const cliArgOptionDefinition = optionsDefinitions[hash.name];

  if (cliArgOptionDefinition.type === "number") {
    return [cliArgOptionName, hash.value as number];
  }

  if (hash.value === true) {
    return cliArgOptionName;
  }

  return `${cliArgOptionName}${cliArgOptionDefinition.spacer}${hash.value}`;
}

function _transformToCLIArguments(
  option: string,
  value: DenoOptionValue,
): CLIArgument {
  const optionType = getOptionType(value);
  const optionDefinitionType = optionsDefinitions[option].type.split("|");

  if (!optionDefinitionType.includes(optionType)) {
    throw new Error(
      `Deno option "${option}" value is incorrect, options supports string, array of strings and boolean.`,
    );
  }

  const argHash = _transformToArgHash(option, value, optionType);

  return _hashToCLIArg(argHash);
}

function _transformToArgHash(
  option: string,
  value: DenoOptionValue,
  optionType: OptionTypeValues,
): hashCliArgType {
  const argValue = optionType === "string[]"
    ? (value as string[]).join(",")
    : value as string | number | boolean;

  return {
    name: option,
    value: argValue,
  };
}

export { buildDenoCLIOptionsArgs };
export type {CLIArgument}