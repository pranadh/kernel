package com.example.kernel.listeners;

import net.luckperms.api.LuckPerms;
import net.luckperms.api.cacheddata.CachedMetaData;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;

import com.example.kernel.commands.ChatControlCommands;

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
        
        // Build format
        String format = (prefix != null ? prefix + " " : "") +
                       ChatColor.WHITE + "%s" +
                       (suffix != null ? " " + suffix : "") +
                       ChatColor.GRAY + " | " +
                       ChatColor.WHITE + "%s";
        
        event.setFormat(format);
    }
}