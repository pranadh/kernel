package com.example.kernel.commands;

import me.clip.placeholderapi.PlaceholderAPI;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import com.example.kernel.utils.ColorUtils;
import com.example.kernel.utils.Constants;

import java.util.ArrayList;
import java.util.List;

public class MetricsCommand implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        // We need a player to use PlaceholderAPI
        Player player = (sender instanceof Player) ? (Player) sender : null;
        
        String metrics = String.join("\n", 
            "&8&m                                                &r",
            "&7Online Players: " + Constants.PRIMARY + "%server_online%",
            "&7Version: " + Constants.PRIMARY + "%server_version%",
            "&7Uptime: " + Constants.PRIMARY + "%server_uptime%",
            "",
            "&7Memory Usage:",
            "  &7Used: " + Constants.PRIMARY + "%server_ram_used%",
            "  &7Free: " + Constants.PRIMARY + "%server_ram_free%",
            "",
            "&7TPS (1m, 5m, 15m):",
            "  " + Constants.PRIMARY + "%server_tps_1_colored%, %server_tps_5_colored%, %server_tps_15_colored%",
            "&8&m                                                &r"
        );

        // Set placeholders if we have a player, otherwise use alternative method
        String formattedMetrics;
        if (player != null) {
            formattedMetrics = PlaceholderAPI.setPlaceholders(player, metrics);
        } else {
            // For console, you might need to handle some placeholders differently
            formattedMetrics = PlaceholderAPI.setPlaceholders(null, metrics);
        }

        // Send the formatted message
        sender.sendMessage(ColorUtils.translateColorCodes(formattedMetrics));
        return true;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        return new ArrayList<>();
    }
}