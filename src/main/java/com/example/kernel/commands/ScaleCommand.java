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

public class ScaleCommand implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/scale <value> [player]"));
            return true;
        }

        try {
            double scale = Double.parseDouble(args[0]);
            
            if (scale < 0.01 || scale > 10) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Scale must be between " + Constants.PRIMARY + "0.01 and 10."));
                return true;
            }

            if (args.length == 1) {
                if (!(sender instanceof Player)) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&cConsole must specify a player."));
                    return true;
                }
                setScale((Player) sender, scale, sender);
                return true;
            }

            Player target = Bukkit.getPlayer(args[1]);
            if (target == null) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + args[1]));
                return true;
            }

            setScale(target, scale, sender);
            return true;

        } catch (NumberFormatException e) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Invalid scale value."));
            return true;
        }
    }

    private void setScale(Player target, double scale, CommandSender sender) {
        target.getAttribute(Attribute.GENERIC_SCALE).setBaseValue(scale);

        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Your scale has been set to " + Constants.PRIMARY + scale + "."));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set scale of "  + Constants.PRIMARY + target.getName() + " &7to " + Constants.PRIMARY + scale + "."));
            target.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Your scale has been set to " + Constants.PRIMARY + scale + "."));
        }
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            List<String> suggestions = new ArrayList<>();
            suggestions.add("0.01");
            suggestions.add("1");
            suggestions.add("10");
            return suggestions.stream()
                    .filter(scale -> scale.startsWith(args[0]))
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