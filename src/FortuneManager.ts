import { CommandInteraction, GuildMember, Message, MessageEmbed, Snowflake } from "discord.js";
import { FortuneCookie, getFortune } from "fortune-cookie-generator";
import RootComponent from "./RootComponent.js";
import { FortuneManagerOptions, FortuneMember } from "./types";

const DAY_IN_MS = 86_400_000;

export default class FortuneManager {
  users: Map<Snowflake, FortuneMember> = new Map();
  options: FortuneManagerOptions;
  static defaults: FortuneManagerOptions = {
    theme: 'AQUA',
    cookiesPerDay: 1
  };

  constructor(options?:Partial<FortuneManagerOptions>) {
    this.options = Object.assign(FortuneManager.defaults, options);
  }

  async serve(root:Message | CommandInteraction) {
    const entity = new RootComponent(root);
    const fortuneMember = this.users.get(entity.member.id) as FortuneMember;
    if (fortuneMember && Date.now() < fortuneMember.nextFortuneTimestamp) {
      const embed = new MessageEmbed()
        .setDescription('<Time Left>')
        .setColor(this.options.theme);
      return void await entity.reply[entity.type]({
        embeds: [embed]
      });
    }

    const now = Date.now();
    const nextOpening = DAY_IN_MS / +this.options.cookiesPerDay;
    let cookie:FortuneCookie = fortuneMember?.nextFortune ? fortuneMember.nextFortune : await getFortune() as FortuneCookie;

    const embed = new MessageEmbed()
      .setTitle(`${entity.member.displayName}'s Fortune`)
      .setColor(this.options.theme)
      .setDescription(cookie.fortune)
      .setFooter({
        text: `Lucky Numbers: ${cookie.luckyNumbers.join(', ')}`
      });
    entity.reply[entity.type]({
      embeds: [embed]
    });

    this.users.set(entity.member.id, Object.assign(entity.member, {
      nextFortune: await getFortune() as FortuneCookie,
      nextFortuneTimestamp: now + nextOpening
    }));

    console.log(this.users.values());
  }
}