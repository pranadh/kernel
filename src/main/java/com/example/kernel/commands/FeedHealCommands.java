package com.example.kernel.commands;

import org.bukkit.Bukkit;
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

public class FeedHealCommands implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            if (!(sender instanceof Player)) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/" + command.getName() + " <player>"));
                return true;
            }
            
            // Self-target if no args provided
            Player player = (Player) sender;
            handleCommand(command.getName(), sender, player);
            return true;
        }

        // Target other player
        Player target = Bukkit.getPlayer(args[0]);
        if (target == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + args[0]));
            return true;
        }

        handleCommand(command.getName(), sender, target);
        return true;
    }

    private void handleCommand(String command, CommandSender sender, Player target) {
        switch (command.toLowerCase()) {
            case "feed":
                feedPlayer(sender, target);
                break;
            case "heal":
                healPlayer(sender, target);
                break;
        }
    }

    private void feedPlayer(CommandSender sender, Player target) {
        target.setFoodLevel(20); // Max food level
        target.setSaturation(20f); // Max saturation
        
        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You have been fed."));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Fed " + Constants.PRIMARY + target.getName() + "&7."));
            target.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You have been fed by " + Constants.PRIMARY + sender.getName() + "&7."));
        }
    }

    private void healPlayer(CommandSender sender, Player target) {
        target.setHealth(target.getMaxHealth()); // Full health
        target.setFoodLevel(20); // Max food level
        target.setSaturation(20f); // Max saturation
        target.setFireTicks(0); // Extinguish fire
        
        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You have been healed."));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Healed " + Constants.PRIMARY + target.getName() + "&7."));
            target.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You have been healed by " + Constants.PRIMARY + sender.getName() + "&7."));
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