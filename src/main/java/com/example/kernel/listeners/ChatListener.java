package com.example.kernel.listeners;

import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerChatEvent;
import org.bukkit.entity.Player;
import org.bukkit.ChatColor;

public class ChatListener implements Listener {
    
    @EventHandler
    public void onPlayerChat(AsyncPlayerChatEvent event) {
        Player player = event.getPlayer();
        String message = event.getMessage();
        
        String rank = ""; // No rank by default
        
        if (player.hasPermission("kernel.owner")) {
            rank = "";
        } else if (player.hasPermission("kernel.manager")) {
            rank = "";
        } else if (player.hasPermission("kernel.admin")) {
            rank = "";
        } else if (player.hasPermission("kernel.mod")) {
            rank = "";
        } else if (player.hasPermission("kernel.helper")) {
            rank = "";
        } else if (player.hasPermission("kernel.builder")) {
            rank = "";
        }

        
        // Set the new format
        String format;
        if (!rank.isEmpty()) {
            format = rank + " " + 
                    ChatColor.WHITE + "%s" + ChatColor.GRAY + " | " + 
                    ChatColor.WHITE + "%s";
        } else {
            format = ChatColor.WHITE + "%s" + ChatColor.GRAY + " | " + 
                    ChatColor.WHITE + "%s";
        }
        
        event.setFormat(format);
    }
}