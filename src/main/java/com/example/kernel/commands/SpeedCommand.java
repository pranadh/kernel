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
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class SpeedCommand implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/speed <value> [player]"));
            return true;
        }

        try {
            float speed = Float.parseFloat(args[0]);
            
            // Validate speed range
            if (speed < 1 || speed > 10) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Speed must be between " + Constants.PRIMARY + "1 and 10."));
                return true;
            }

            // Convert to Minecraft speed value (1-10 to 0.1-1.0)
            float normalizedSpeed = speed / 10f;

            // Handle target player
            Player target;
            if (args.length > 1) {
                target = Bukkit.getPlayer(args[1]);
                if (target == null) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + args[1]));
                    return true;
                }
            } else {
                if (!(sender instanceof Player)) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Console must specify a player."));
                    return true;
                }
                target = (Player) sender;
            }

            setSpeed(sender, target, normalizedSpeed);
            return true;

        } catch (NumberFormatException e) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Invalid speed value!"));
            return true;
        }
    }

    private void setSpeed(CommandSender sender, Player target, float speed) {
        String speedType;
        
        if (target.isFlying()) {
            target.setFlySpeed(speed);
            speedType = "flight";
        } else {
            target.setWalkSpeed(speed);
            speedType = "walk";
        }

        // Convert back to 1-10 scale for messages
        int displaySpeed = (int) (speed * 10);

        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set your " + speedType + " speed to " + Constants.PRIMARY + displaySpeed + "&7."));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set " + Constants.PRIMARY + target.getName() + 
                "&7's " + speedType + " speed to " + Constants.PRIMARY + displaySpeed + "&7."));
            target.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Your " + speedType + " speed has been set to " + 
                Constants.PRIMARY + displaySpeed + "&7."));
        }
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            List<String> speeds = Arrays.asList("1", "5", "10");
            return speeds.stream()
                    .filter(speed -> speed.startsWith(args[0]))
                    .collect(Collectors.toList());
        }
        
        if (args.length == 2) {
            return Bukkit.getOnlinePlayers().stream()
                    .map(Player::getName)
                    .filter(name -> name.toLowerCase().startsWith(args[1].toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        return new ArrayList<>();
    }
}