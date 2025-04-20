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
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ChatControlCommands implements CommandExecutor, TabCompleter {
    private boolean isChatMuted = false;
    private int slowMode = 5; // Seconds between messages - base 5 seconds
    private final HashMap<UUID, Long> lastMessageTime = new HashMap<>();

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            showHelp(sender);
            return true;
        }

        String subCommand = args[0].toLowerCase();
        switch (subCommand) {
            case "help":
                showHelp(sender);
                break;
            case "clear":
                clearChat(sender);
                break;
            case "mute":
                toggleMute(sender);
                break;
            case "slow":
                if (args.length < 2) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/chat slow <seconds>"));
                    return true;
                }
                try {
                    int seconds = Integer.parseInt(args[1]);
                    setSlowMode(sender, seconds);
                } catch (NumberFormatException e) {
                    sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Invalid number format!"));
                }
                break;
            default:
                showHelp(sender);
                break;
        }
        return true;
    }

    private void showHelp(CommandSender sender) {
        sender.sendMessage(ColorUtils.translateColorCodes("&#c6b78f&lC&#c3b28a&lO&#c0ae86&lM&#bda981&lM&#baa57d&lA&#b7a078&lN&#b49c74&lD&#b1976f&lS &#ae936b&lL&#ab8e66&lI&#a88a62&lS&#a5855d&lT"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/chat clear &8- &7Clear the chat"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/chat mute &8- &7Toggle chat mute"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/chat slow <seconds> &8- &7Set chat slow mode"));
        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PRIMARY + "/chat help &8- &7Show this help message"));
    }

    private void clearChat(CommandSender sender) {
        if (!sender.hasPermission("kernel.chat.clear")) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You don't have permission to clear the chat."));
            return;
        }

        // Send 100 blank lines to clear chat
        for (int i = 0; i < 100; i++) {
            Bukkit.broadcastMessage("");
        }
        
        Bukkit.broadcastMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Chat has been cleared by " + Constants.PRIMARY + sender.getName() + "."));
    }

    private void toggleMute(CommandSender sender) {
        if (!sender.hasPermission("kernel.chat.mute")) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You don't have permission to mute the chat."));
            return;
        }

        isChatMuted = !isChatMuted;
        String status = isChatMuted ? "&aenabled" : "&cdisabled";
        Bukkit.broadcastMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Chat mute has been " + status + " &7by " + Constants.PRIMARY + sender.getName() + "."));
    }

    private void setSlowMode(CommandSender sender, int seconds) {
        if (!sender.hasPermission("kernel.chat.slow")) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7You don't have permission to set slow mode."));
            return;
        }

        if (seconds < 0) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Slow mode time cannot be &cnegative."));
            return;
        }

        slowMode = seconds;
        if (seconds == 0) {
            Bukkit.broadcastMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Chat slow mode has been &cdisabled &7by " + Constants.PRIMARY + sender.getName() + "."));
        } else {
            Bukkit.broadcastMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Chat slow mode has been set to " + Constants.PRIMARY + seconds + " &7seconds by " + Constants.PRIMARY + sender.getName() + "."));
        }
    }

    public boolean canChat(Player player) {
        if (player.hasPermission("kernel.chat.bypass")) {
            return true;
        }

        if (isChatMuted) {
            player.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Chat is currently muted."));
            return false;
        }

        if (slowMode > 0) {
            long currentTime = System.currentTimeMillis();
            long lastMessage = lastMessageTime.getOrDefault(player.getUniqueId(), 0L);
            
            if (currentTime - lastMessage < slowMode * 1000) {
                int remainingSeconds = (int) ((slowMode * 1000 - (currentTime - lastMessage)) / 1000);
                player.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Wait " + Constants.PRIMARY + remainingSeconds + " &7seconds before sending another message."));
                return false;
            }
            
            lastMessageTime.put(player.getUniqueId(), currentTime);
        }

        return true;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            List<String> subCommands = Arrays.asList("help", "clear", "mute", "slow");
            return subCommands.stream()
                    .filter(sc -> sc.toLowerCase().startsWith(args[0].toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        if (args.length == 2 && args[0].equalsIgnoreCase("slow")) {
            List<String> suggestions = Arrays.asList("5", "10", "30", "60");
            return suggestions.stream()
                    .filter(time -> time.startsWith(args[1]))
                    .collect(Collectors.toList());
        }
        
        return new ArrayList<>();
    }
}