package com.example.kernel.listeners;

import net.luckperms.api.LuckPerms;
import net.luckperms.api.cacheddata.CachedMetaData;
import net.md_5.bungee.api.chat.ComponentBuilder;
import net.md_5.bungee.api.chat.HoverEvent;
import net.md_5.bungee.api.chat.TextComponent;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;

import com.example.kernel.commands.ChatControlCommands;
import com.example.kernel.utils.ColorUtils;

import me.clip.placeholderapi.PlaceholderAPI;

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
        
        // Check if player's group is default
        String primaryGroup = luckPerms.getUserManager().getUser(player.getUniqueId()).getPrimaryGroup();
        if (primaryGroup.equalsIgnoreCase("default")) {
            nameComponent.setColor(net.md_5.bungee.api.ChatColor.GRAY);
        } else {
            nameComponent.setColor(net.md_5.bungee.api.ChatColor.WHITE);
        }
        
        nameComponent.setHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, new ComponentBuilder(hoverText).create()));
        
        // Create suffix and message components
        TextComponent suffixComponent = new TextComponent(suffix != null ? ColorUtils.translateColorCodes(" " + suffix) : "");
        TextComponent separatorComponent = new TextComponent(": ");
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
        // Check if player's group is default
        String primaryGroup = luckPerms.getUserManager().getUser(player.getUniqueId()).getPrimaryGroup();
        String nameColor = primaryGroup.equalsIgnoreCase("default") ? "&7" : "&f";
    
        // Get player stats with PlaceholderAPI
        String playtime = String.format("%sd, %sh, %sm",
            PlaceholderAPI.setPlaceholders(player, "%statistic_time_played:days%"),
            PlaceholderAPI.setPlaceholders(player, "%statistic_time_played:hours%"),
            PlaceholderAPI.setPlaceholders(player, "%statistic_time_played:minutes%")
        );
    
        // Get join date and trim the time portion
        String joinDate = PlaceholderAPI.setPlaceholders(player, "%player_first_join_date%");
        if (joinDate.contains(" ")) {
            joinDate = joinDate.split(" ")[0]; // Keep only the date part
        }
    
        // Format hover text with line breaks
        String hoverText = String.format(
            "%s%s\n" +
            " &ePlaytime: &7%s\n" +
            " &aJoined: &7%s\n" +
            " &cDeaths: &7%s",
            prefix != null ? prefix + " " + nameColor : nameColor + player.getName(),
            player.getName(),
            playtime,
            joinDate,
            PlaceholderAPI.setPlaceholders(player, "%statistic_deaths%")
        );
    
        return ColorUtils.translateColorCodes(hoverText);
    }
}