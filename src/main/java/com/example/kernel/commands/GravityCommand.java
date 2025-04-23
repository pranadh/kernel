package com.example.kernel.commands;

import org.bukkit.Bukkit;
import org.bukkit.attribute.Attribute;
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

public class GravityCommand implements CommandExecutor, TabCompleter {

    private final double DEFAULT_GRAVITY = 0.08;

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/gravity <value> [player]"));
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Base gravity value is " + Constants.PRIMARY + "0.08."));
            return true;
        }

        try {
            double gravity = Double.parseDouble(args[0]);
            
            if (gravity < 0 || gravity > 0.16) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Gravity must be between " + Constants.PRIMARY + "0 and 0.16."));
                return true;
            }

            if (args.length == 1) {
                if (!(sender instanceof Player)) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&cConsole must specify a player."));
                    return true;
                }
                setGravity((Player) sender, gravity, sender);
                return true;
            }

            Player target = Bukkit.getPlayer(args[1]);
            if (target == null) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + args[1]));
                return true;
            }

            setGravity(target, gravity, sender);
            return true;

        } catch (NumberFormatException e) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Invalid gravity value."));
            return true;
        }
    }

    private void setGravity(Player target, double gravity, CommandSender sender) {
        target.getAttribute(Attribute.GENERIC_GRAVITY).setBaseValue(gravity);

        String gravityDesc;
        if (gravity == 0) {
            gravityDesc = "no gravity";
        } else if (gravity == DEFAULT_GRAVITY) {
            gravityDesc = "normal gravity";
        } else if (gravity < DEFAULT_GRAVITY) {
            double percentage = Math.round((gravity / DEFAULT_GRAVITY) * 100);
            gravityDesc = percentage + "% of normal gravity";
        } else {
            double multiplier = Math.round((gravity / DEFAULT_GRAVITY) * 100) / 100.0;
            gravityDesc = multiplier + "x normal gravity";
        }

        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Your gravity has been set to " + Constants.PRIMARY + gravity + " &7(" + gravityDesc + ")."));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set gravity of " + Constants.PRIMARY + target.getName() + " &7to " + Constants.PRIMARY + gravity + " &7(" + gravityDesc + ")."));
            target.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Your gravity has been set to " + Constants.PRIMARY + gravity + " &7(" + gravityDesc + ")."));
        }
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            List<String> suggestions = new ArrayList<>();
            suggestions.add("0");
            suggestions.add("0.04");
            suggestions.add("0.08");
            suggestions.add("0.16");
            return suggestions.stream()
                    .filter(gravity -> gravity.startsWith(args[0]))
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