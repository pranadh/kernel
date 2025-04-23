package com.example.kernel.managers;

import me.clip.placeholderapi.PlaceholderAPI;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.scoreboard.DisplaySlot;
import org.bukkit.scoreboard.Objective;
import org.bukkit.scoreboard.Scoreboard;
import org.bukkit.scoreboard.Team;
import java.awt.Color;
import net.md_5.bungee.api.ChatColor;

import com.example.kernel.Kernel;

public class ScoreboardManager implements Listener {
    private final Kernel plugin;
    private final String LOGO = ""; // Unicode logo character from your resource pack
    
    // Parse the primary color as RGB
    private final ChatColor PRIMARY_COLOR = ChatColor.of(new Color(255, 236, 184)); // #ffecb8
    private final ChatColor SECONDARY_COLOR = ChatColor.of(new Color(255, 215, 105)); // #ffd769

    public ScoreboardManager(Kernel plugin) {
        this.plugin = plugin;
        startScoreboardUpdater();
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        createScoreboard(event.getPlayer());
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        event.getPlayer().setScoreboard(Bukkit.getScoreboardManager().getMainScoreboard());
    }

    private void createScoreboard(Player player) {
        Scoreboard board = Bukkit.getScoreboardManager().getNewScoreboard();
        
        // Use the LOGO as the title with RGB color support
        Objective obj = board.registerNewObjective("main", "dummy", LOGO);
            
        obj.setDisplaySlot(DisplaySlot.SIDEBAR);
        updateScoreboard(player, obj, board);
        player.setScoreboard(board);
    }

    private void updateScoreboard(Player player, Objective obj, Scoreboard board) {
        // Clear existing scores
        for (String entry : player.getScoreboard().getEntries()) {
            player.getScoreboard().resetScores(entry);
        }
    
        // Get values from PlaceholderAPI
        String rankPrefix = PlaceholderAPI.setPlaceholders(player, "%luckperms_prefix%");
        String playerName = PlaceholderAPI.setPlaceholders(player, "%player_name%");
        String ping = PlaceholderAPI.setPlaceholders(player, "%player_ping%");
        String tps = PlaceholderAPI.setPlaceholders(player, "%server_tps_1_colored%");
        String date = PlaceholderAPI.setPlaceholders(player, "%localtime_time_MMM d, Y%");
        String playtime = String.format("%sd, %sh, %sm",
            PlaceholderAPI.setPlaceholders(player, "%statistic_time_played:days%"),
            PlaceholderAPI.setPlaceholders(player, "%statistic_time_played:hours%"),
            PlaceholderAPI.setPlaceholders(player, "%statistic_time_played:minutes%")
        );
        String serverIP = "ᴘʟᴀʏ.ᴋᴇʀɴᴇʟ.ɢᴀᴍᴇѕ";
    
        // Create teams with RGB colors and formatting
        createTeamLine(board, "line1", ChatColor.STRIKETHROUGH + "                                 ", 10, ChatColor.DARK_GRAY);
        createTeamLine(board, "date", ChatColor.GRAY + "        ⏰ " + date, 9, PRIMARY_COLOR);
        createTeamLine(board, "player", "" + SECONDARY_COLOR + ChatColor.BOLD + playerName, 8, PRIMARY_COLOR);
        createTeamLine(board, "rank", "  " + ChatColor.WHITE + " " + PRIMARY_COLOR + "Rank: ", 7, PRIMARY_COLOR, ChatColor.WHITE, rankPrefix);
        createTeamLine(board, "ping", "  " + ChatColor.WHITE + " " + PRIMARY_COLOR + "Ping: ", 6, PRIMARY_COLOR, ChatColor.WHITE, ping + "ms");
        createTeamLine(board, "tps", "  " + ChatColor.WHITE + " " + PRIMARY_COLOR + "TPS: ", 5, PRIMARY_COLOR, ChatColor.WHITE, tps);
        createTeamLine(board, "playtime", "  " + ChatColor.WHITE + " " + PRIMARY_COLOR + "Playtime: ", 4, PRIMARY_COLOR, ChatColor.WHITE, playtime);
        createTeamLine(board, "blank1", " ", 3, PRIMARY_COLOR);
        createTeamLine(board, "ip", " ", 2, ChatColor.GRAY, ChatColor.GRAY, serverIP);
        createTeamLine(board, "line2", ChatColor.STRIKETHROUGH + "                                ", 1, ChatColor.DARK_GRAY);
    }
    
    private void createTeamLine(Scoreboard board, String name, String text, int score, ChatColor prefixColor, ChatColor valueColor, String value) {
        // Create a unique entry for this line
        String entry = getUniqueCode(score);
        
        // Register a team for this line
        Team team = board.getTeam(name);
        if (team == null) {
            team = board.registerNewTeam(name);
        }
        
        team.addEntry(entry);
        
        if (value != null && valueColor != null) {
            team.setPrefix(prefixColor + text);
            team.setSuffix(valueColor + value);
        } else {
            team.setPrefix(prefixColor + text);
        }
        
        // Set the score
        board.getObjective("main").getScore(entry).setScore(score);
    }
    
    // Add this overload for backward compatibility with existing code
    private void createTeamLine(Scoreboard board, String name, String text, int score, ChatColor... colors) {
        // Create a unique entry for this line
        String entry = getUniqueCode(score);
        
        // Register a team for this line
        Team team = board.getTeam(name);
        if (team == null) {
            team = board.registerNewTeam(name);
        }
        
        team.addEntry(entry);
        
        // Apply colors and formatting
        if (colors.length > 0) {
            StringBuilder prefix = new StringBuilder();
            
            // First color applies to the prefix
            prefix.append(colors[0]);
            
            // Additional color can be applied to specific parts in the text
            if (text.contains(":") && colors.length > 1) {
                String[] parts = text.split(":");
                team.setPrefix(prefix + parts[0] + ":");
                team.setSuffix(colors[1] + parts[1]);
            } else {
                team.setPrefix(prefix + text);
            }
        } else {
            team.setPrefix(text);
        }
        
        // Set the score
        board.getObjective("main").getScore(entry).setScore(score);
    }
    
    private String getUniqueCode(int index) {
        // Use ChatColor values as unique entries for each line
        return ChatColor.values()[index % ChatColor.values().length] + "" + 
              ChatColor.values()[(index + 8) % ChatColor.values().length];
    }

    private void startScoreboardUpdater() {
        Bukkit.getScheduler().runTaskTimer(plugin, () -> {
            for (Player player : Bukkit.getOnlinePlayers()) {
                Scoreboard board = player.getScoreboard();
                Objective obj = board.getObjective("main");
                if (obj != null) {
                    updateScoreboard(player, obj, board);
                } else {
                    createScoreboard(player);
                }
            }
        }, 20L, 20L); // Update every second
    }
}