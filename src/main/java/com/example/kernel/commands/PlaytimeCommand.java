package com.example.kernel.commands;

import me.clip.placeholderapi.PlaceholderAPI;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import com.example.kernel.utils.ColorUtils;
import com.example.kernel.utils.Constants;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class PlaytimeCommand implements CommandExecutor, TabCompleter {
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            if (!(sender instanceof Player)) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/playtime <player>"));
                return true;
            }
            
            Player player = (Player) sender;
            showPlaytime(sender, player);
            return true;
        } else {
            String targetName = args[0];
            Player target = Bukkit.getPlayer(targetName);

            if (target == null) {
                // Check if player has played before
                OfflinePlayer offlinePlayer = Bukkit.getOfflinePlayer(targetName);
                if (!offlinePlayer.hasPlayedBefore()) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + targetName));
                    return true;
                }
                showOfflinePlaytime(sender, offlinePlayer);
                return true;
            }

            showPlaytime(sender, target);
            return true;
        }
    }

    private void showOfflinePlaytime(CommandSender sender, OfflinePlayer target) {
        String playtime = String.format("%sd, %sh, %sm, %ss",
            PlaceholderAPI.setPlaceholders(target, "%statistic_time_played:days%"),
            PlaceholderAPI.setPlaceholders(target, "%statistic_time_played:hours%"),
            PlaceholderAPI.setPlaceholders(target, "%statistic_time_played:minutes%"),
            PlaceholderAPI.setPlaceholders(target, "%statistic_time_played:seconds%")
        );
        
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + Constants.PRIMARY + 
            target.getName() + "&7 has a playtime of " + Constants.PRIMARY + playtime));
    }
    
    private void showPlaytime(CommandSender sender, Player target) {
        String playtime = String.format("%sd, %sh, %sm, %ss",
            PlaceholderAPI.setPlaceholders(target, "%statistic_time_played:days%"),
            PlaceholderAPI.setPlaceholders(target, "%statistic_time_played:hours%"),
            PlaceholderAPI.setPlaceholders(target, "%statistic_time_played:minutes%"),
            PlaceholderAPI.setPlaceholders(target, "%statistic_time_played:seconds%")
        );
        
        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + 
                "&7You have a playtime of " + Constants.PRIMARY + playtime));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + Constants.PRIMARY + 
                target.getName() + "&7 has a playtime of " + Constants.PRIMARY + playtime));
        }
    }
    
    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            return Bukkit.getOnlinePlayers().stream()
                    .map(Player::getName)
                    .filter(name -> name.toLowerCase().startsWith(args[0].toLowerCase()))
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
}