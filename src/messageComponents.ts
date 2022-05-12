import { MessageActionRow, MessageButton } from "discord.js";

export const openButton = new MessageButton()
  .setCustomId('open')
  .setStyle('PRIMARY')
  .setLabel('Open');
export const optOutButton = new MessageButton()
  .setCustomId('opt-out')
  .setStyle('DANGER')
  .setLabel('🛑');
export const fortuneCookieRow = new MessageActionRow()
  .addComponents([openButton, optOutButton]);