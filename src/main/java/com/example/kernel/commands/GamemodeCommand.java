package com.example.kernel.commands;

import org.bukkit.Bukkit;
import org.bukkit.GameMode;
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

public class GamemodeCommand implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        String cmdName = command.getName().toLowerCase();
        
        // Handle specific gamemode commands (gmc, gms, etc.)
        if (cmdName.startsWith("gm") && cmdName.length() > 2) {
            GameMode mode = null;
            switch (cmdName.substring(2)) {
                case "c": mode = GameMode.CREATIVE; break;
                case "s": mode = GameMode.SURVIVAL; break;
                case "sp": mode = GameMode.SPECTATOR; break;
                case "a": mode = GameMode.ADVENTURE; break;
            }
            
            if (mode != null) {
                return handleGamemodeChange(sender, args, mode);
            }
        }

        // Handle /gm command
        if (args.length < 1) {
            showHelp(sender);
            return true;
        }

        GameMode mode;
        try {
            mode = GameMode.valueOf(args[0].toUpperCase());
        } catch (IllegalArgumentException e) {
            switch (args[0].toLowerCase()) {
                case "c":
                case "creative":
                case "1": mode = GameMode.CREATIVE; break;
                case "s":
                case "survival":
                case "0": mode = GameMode.SURVIVAL; break;
                case "sp":
                case "spectator":
                case "3": mode = GameMode.SPECTATOR; break;
                case "a":
                case "adventure":
                case "2": mode = GameMode.ADVENTURE; break;
                default:
                    showHelp(sender);
                    return true;
            }
        }

        String[] newArgs = Arrays.copyOfRange(args, 1, args.length);
        return handleGamemodeChange(sender, newArgs, mode);
    }

    private boolean handleGamemodeChange(CommandSender sender, String[] args, GameMode mode) {
        Player target;

        if (args.length > 0) {
            target = Bukkit.getPlayer(args[0]);
            if (target == null) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + args[0]));
                return true;
            }
        } else {
            if (!(sender instanceof Player)) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Console must specify a player."));
                return true;
            }
            target = (Player) sender;
        }

        // Set gamemode
        target.setGameMode(mode);

        // Send messages
        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set your gamemode to " + Constants.PRIMARY + formatGameMode(mode) + "&7."));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set " + Constants.PRIMARY + target.getName() + 
                "&7's gamemode to " + Constants.PRIMARY + formatGameMode(mode) + "&7."));
            target.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Your gamemode has been set to " + 
                Constants.PRIMARY + formatGameMode(mode) + "&7."));
        }

        return true;
    }

    private String formatGameMode(GameMode mode) {
        return mode.name().charAt(0) + mode.name().substring(1).toLowerCase();
    }

    private void showHelp(CommandSender sender) {
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage:"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/gm <mode> [player] &8- &7Set gamemode"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/gmc [player] &8- &7Creative mode"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/gms [player] &8- &7Survival mode"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/gmsp [player] &8- &7Spectator mode"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/gma [player] &8- &7Adventure mode"));
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (command.getName().equalsIgnoreCase("gm")) {
            if (args.length == 1) {
                List<String> modes = Arrays.asList("creative", "survival", "spectator", "adventure", "c", "s", "sp", "a");
                return modes.stream()
                        .filter(mode -> mode.toLowerCase().startsWith(args[0].toLowerCase()))
                        .collect(Collectors.toList());
            }
        }
        
        // Handle player names for all commands
        if ((command.getName().equalsIgnoreCase("gm") && args.length == 2) ||
            (command.getName().toLowerCase().startsWith("gm") && args.length == 1)) {
            return Bukkit.getOnlinePlayers().stream()
                    .map(Player::getName)
                    .filter(name -> name.toLowerCase().startsWith(args[args.length - 1].toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        return new ArrayList<>();
    }
}