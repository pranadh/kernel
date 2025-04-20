package com.example.kernel.managers;

import net.luckperms.api.LuckPerms;
import net.luckperms.api.cacheddata.CachedMetaData;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.scoreboard.Scoreboard;
import org.bukkit.scoreboard.Team;

import com.example.kernel.utils.ColorUtils;

public class TabManager implements Listener {
    private final LuckPerms luckPerms;
    private final Scoreboard scoreboard;

    public TabManager(LuckPerms luckPerms, Scoreboard scoreboard) {
        this.luckPerms = luckPerms;
        this.scoreboard = scoreboard;
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        updatePlayerTab(event.getPlayer());
    }

    public void updatePlayerTab(Player player) {
        CachedMetaData metaData = luckPerms.getPlayerAdapter(Player.class)
                .getMetaData(player);

        String prefix = metaData.getPrefix();
        
        // Create or get team for the player
        String teamName = player.getName();
        if (teamName.length() > 16) {
            teamName = teamName.substring(0, 16);
        }

        Team team = scoreboard.getTeam(teamName);
        if (team == null) {
            team = scoreboard.registerNewTeam(teamName);
        }

        // Set prefix and suffix
        if (prefix != null) {
            team.setPrefix(ColorUtils.translateColorCodes(prefix + " "));
        }

        // Add player to team
        team.addEntry(player.getName());
        
        // Update player's display name
        String displayName = player.getName();
        player.setDisplayName(ColorUtils.translateColorCodes(displayName));
        player.setPlayerListName(ColorUtils.translateColorCodes(displayName));
    }

    public void removePlayer(Player player) {
        Team team = scoreboard.getTeam(player.getName());
        if (team != null) {
            team.unregister();
        }
    }
}