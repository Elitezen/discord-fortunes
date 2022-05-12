import { CommandInteraction, GuildMember, Message, MessageEmbed, Snowflake } from "discord.js";
import { FortuneCookie, getFortune } from "fortune-cookie-generator";
import RootComponent from "./RootComponent.js";
import { FortuneManagerOptions, FortuneMember } from "./types";
import { fortuneCookieRow } from "./messageComponents.js";

const DAY_IN_MS = 86_400_000;

export default class FortuneManager {
  users: Map<Snowflake, FortuneMember> = new Map();
  notifOptOutUsers: Set<Snowflake>;
  options: FortuneManagerOptions;
  static defaults: FortuneManagerOptions = {
    theme: 'AQUA',
    cookiesPerDay: 1,
    enableNotifications: false
  };

  constructor(options?:Partial<FortuneManagerOptions>) {
    this.options = Object.assign(FortuneManager.defaults, options);
    this.notifOptOutUsers = new Set();
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
    const nextOpening = FortuneManager.timesPerDay(+this.options.cookiesPerDay);
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

    if (this.options.enableNotifications && !this.notifOptOutUsers.has(fortuneMember.id)) {
      setTimeout(() => this.notifyMember(fortuneMember), nextOpening);
    }
  }

  async notifyMember(member:FortuneMember) {
    const cookie = member.nextFortune!;
    const embed = new MessageEmbed()
      .setTitle('Your New Fortune is Ready!')
      .setColor(this.options.theme)
      .setDescription('Use the button below to open!')
      .setFooter({
        text: 'To opt out of these notifications use the stop button below'
      })
    
    try {
      const m = await member
        .send({
          embeds: [embed],
          components: [fortuneCookieRow]
        });

      const collector = m.createMessageComponentCollector({
        componentType: 'ACTION_ROW'
      });

      collector.on('collect', i => {
        if (i.customId == 'open') {
          // Show cookie
        } else {
          this.notifOptOutUsers.add(member.id);
        }
      });
    } catch (_) {
      return undefined;
    }
  }

  static timesPerDay(n:number) {
    return DAY_IN_MS / n;
  }
}