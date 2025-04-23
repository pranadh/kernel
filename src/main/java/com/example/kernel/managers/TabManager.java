package com.example.kernel.managers;

import me.clip.placeholderapi.PlaceholderAPI;
import net.luckperms.api.LuckPerms;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.scoreboard.Scoreboard;
import org.bukkit.scoreboard.Team;

import com.example.kernel.Kernel;
import com.example.kernel.utils.ColorUtils;
import com.example.kernel.utils.Constants;

public class TabManager implements Listener {
    private final LuckPerms luckPerms;
    private final Scoreboard scoreboard;
    private final Kernel plugin;
    private final String LOGO = ""; // Unicode logo character from resource pack

    public TabManager(LuckPerms luckPerms, Scoreboard scoreboard, Kernel plugin) {
        this.luckPerms = luckPerms;
        this.scoreboard = scoreboard;
        this.plugin = plugin;
        startTabUpdater();
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        updatePlayerTab(event.getPlayer());
    }

    private void updateTabList(Player player) {
        // Header with logo
        String header = "\n\n\n\n\n\n\n" + LOGO;
    
        // Footer with server stats using PlaceholderAPI
        String footer = "\n" +
                       " &f " + Constants.PRIMARY + "Players: &f%server_online%&8/&f%server_max_players% &8&l/" +
                       " &f " + Constants.PRIMARY + "Ping: &f%player_ping%ms &8&l/" +
                       " &f " + Constants.PRIMARY + "TPS: " + "%server_tps_1_colored% " +
                       "\n";
    
        // Set header and footer with placeholders
        player.setPlayerListHeader(ColorUtils.translateColorCodes(header));
        player.setPlayerListFooter(ColorUtils.translateColorCodes(PlaceholderAPI.setPlaceholders(player, footer)));
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

        // Update header and footer
        updateTabList(player);
    }

    private void startTabUpdater() {
        // Update tab list every second for online players
        plugin.getServer().getScheduler().runTaskTimerAsynchronously(plugin, () -> {
            for (Player player : plugin.getServer().getOnlinePlayers()) {
                updateTabList(player);
            }
        }, 20L, 20L);
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