package com.example.kernel.listeners;

import net.luckperms.api.LuckPerms;
import net.luckperms.api.cacheddata.CachedMetaData;
import net.md_5.bungee.api.chat.ComponentBuilder;
import net.md_5.bungee.api.chat.HoverEvent;
import net.md_5.bungee.api.chat.TextComponent;
import org.bukkit.Statistic;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;

import com.example.kernel.commands.ChatControlCommands;
import com.example.kernel.utils.ColorUtils;

public class ChatListener implements Listener {
    private final ChatControlCommands chatControl;
    private final LuckPerms luckPerms;

    public ChatListener(ChatControlCommands chatControl, LuckPerms luckPerms) {
        this.chatControl = chatControl;
        this.luckPerms = luckPerms;
    }
    
    @EventHandler
    public void onPlayerChat(AsyncPlayerChatEvent event) {
        Player player = event.getPlayer();
        
        if (!chatControl.canChat(player)) {
            event.setCancelled(true);
            return;
        }

        // Get LuckPerms metadata
        CachedMetaData metaData = luckPerms.getPlayerAdapter(Player.class)
                .getMetaData(player);

        String prefix = metaData.getPrefix();
        String suffix = metaData.getSuffix();
        
        // Create hover text
        String hoverText = createHoverText(player, prefix);
        
        // Create the message components
        TextComponent prefixComponent = new TextComponent(prefix != null ? ColorUtils.translateColorCodes(prefix + " ") : "");
        
        // Create player name component with hover
        TextComponent nameComponent = new TextComponent(player.getName());
        nameComponent.setColor(net.md_5.bungee.api.ChatColor.WHITE);
        nameComponent.setHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, new ComponentBuilder(hoverText).create()));
        
        // Create suffix and message components
        TextComponent suffixComponent = new TextComponent(suffix != null ? ColorUtils.translateColorCodes(" " + suffix) : "");
        TextComponent separatorComponent = new TextComponent(" | ");
        separatorComponent.setColor(net.md_5.bungee.api.ChatColor.GRAY);
        TextComponent messageComponent = new TextComponent(event.getMessage());
        messageComponent.setColor(net.md_5.bungee.api.ChatColor.WHITE);

        // Combine all components
        TextComponent finalMessage = new TextComponent();
        finalMessage.addExtra(prefixComponent);
        finalMessage.addExtra(nameComponent);
        finalMessage.addExtra(suffixComponent);
        finalMessage.addExtra(separatorComponent);
        finalMessage.addExtra(messageComponent);

        // Cancel the original event and send our custom message
        event.setCancelled(true);
        event.getRecipients().forEach(recipient -> recipient.spigot().sendMessage(finalMessage));
    }

    private String createHoverText(Player player, String prefix) {
        // Calculate playtime
        int ticks = player.getStatistic(Statistic.PLAY_ONE_MINUTE);
        int seconds = ticks / 20;
        int minutes = seconds / 60;
        int hours = minutes / 60;
        int days = hours / 24;
        
        hours %= 24;
        minutes %= 60;

        // Format hover text with line breaks
        return ColorUtils.translateColorCodes(
            (prefix != null ? prefix + " " : "") + player.getName() + "\n" +
            "&fPlaytime: &7" + days + "d " + hours + "h " + minutes + "m"
        );
    }
}