package com.example.kernel.commands;

import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import com.example.kernel.utils.ColorUtils;
import com.example.kernel.utils.Constants;

import org.bukkit.Statistic;

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
        int ticks = target.getStatistic(Statistic.PLAY_ONE_MINUTE);
        
        int seconds = ticks / 20;
        int minutes = seconds / 60;
        int hours = minutes / 60;
        int days = hours / 24;
        
        hours %= 24;
        minutes %= 60;
        seconds %= 60;
        
        String timeString = String.format("%dd, %dh, %dm, %ds", days, hours, minutes, seconds);
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + Constants.PRIMARY + target.getName() + "&7 has a playtime of " + Constants.PRIMARY + timeString));
    }
    
    private void showPlaytime(CommandSender sender, Player target) {
        // Get playtime in ticks (20 ticks = 1 second)
        int ticks = target.getStatistic(Statistic.PLAY_ONE_MINUTE);
        
        // Convert to more readable format
        int seconds = ticks / 20;
        int minutes = seconds / 60;
        int hours = minutes / 60;
        int days = hours / 24;
        
        hours %= 24;
        minutes %= 60;
        seconds %= 60;
        
        // Format the message
        String timeString = String.format("%dd, %dh, %dm, %ds", days, hours, minutes, seconds);
        
        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You have a playtime of " + Constants.PRIMARY + timeString));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + Constants.PRIMARY + target.getName() + "&7 has a playtime of " + Constants.PRIMARY + timeString));
        }
    }
    
    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            // Return a list of online player names that match the beginning of what's typed
            return Bukkit.getOnlinePlayers().stream()
                    .map(Player::getName)
                    .filter(name -> name.toLowerCase().startsWith(args[0].toLowerCase()))
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
}