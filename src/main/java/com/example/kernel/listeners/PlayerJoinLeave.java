package com.example.kernel.listeners;

import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;

import com.example.kernel.utils.ColorUtils;
import com.example.kernel.utils.Constants;

public class PlayerJoinLeave implements Listener {

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        if (!player.hasPlayedBefore()) {
            event.setJoinMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "&l* " + Constants.PRIMARY + player.getName() + " &7joined the server. &d&l(NEW)"));
        } else {
            event.setJoinMessage(ColorUtils.translateColorCodes(Constants.PRIMARY +  "&l* " + Constants.PRIMARY + player.getName() + " &7joined the server."));
        }
    }

    @EventHandler
    public void onPlayerLeave(PlayerQuitEvent event) {
        Player player = event.getPlayer();
        event.setQuitMessage(ColorUtils.translateColorCodes("§6§l* §e" + player.getDisplayName() + " §7left the server."));
    }
}
