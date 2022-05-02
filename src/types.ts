import { ColorResolvable, GuildMember } from "discord.js";
import { FortuneCookie } from "fortune-cookie-generator";

export interface FortuneManagerOptions {
  theme: ColorResolvable;
  cookiesPerDay: number | `${number}`;
}

export interface FortuneMember extends GuildMember {
  nextFortune: FortuneCookie | null;
  nextFortuneTimestamp: number;
}