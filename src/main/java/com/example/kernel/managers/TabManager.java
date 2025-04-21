package com.example.kernel.managers;

import me.clip.placeholderapi.PlaceholderAPI;
import net.luckperms.api.LuckPerms;
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
        // Clean up existing teams
        removePlayer(player);

        // Create team name from player name
        String teamName = player.getName();
        if (teamName.length() > 16) {
            teamName = teamName.substring(0, 16);
        }

        Team team = scoreboard.registerNewTeam(teamName);

        String prefix = PlaceholderAPI.setPlaceholders(player, "%luckperms_prefix%");
        
        if (prefix != null && !prefix.isEmpty()) {
            team.setPrefix(ColorUtils.translateColorCodes(prefix + " "));
        } else {
            team.setPrefix("");
        }

        team.addEntry(player.getName());

        // Update display name and tab list name using PlaceholderAPI
        String displayName = PlaceholderAPI.setPlaceholders(player, "%luckperms_prefix% %player_name%");
        player.setDisplayName(ColorUtils.translateColorCodes(displayName));
        player.setPlayerListName(ColorUtils.translateColorCodes(displayName));
    }

    public void removePlayer(Player player) {
        // Remove player from any existing teams
        for (Team team : scoreboard.getTeams()) {
            if (team.hasEntry(player.getName())) {
                team.removeEntry(player.getName());
            }
        }
        
        Team personalTeam = scoreboard.getTeam(player.getName());
        if (personalTeam != null) {
            personalTeam.unregister();
        }
    }
}