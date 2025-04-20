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

public class VanishCommand implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            if (!(sender instanceof Player)) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/vanish <player>"));
                return true;
            }

            Player player = (Player) sender;
            toggleVanish(player, player);
            return true;
        }

        Player target = Bukkit.getPlayer(args[0]);
        if (target == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + args[0]));
            return true;
        }

        toggleVanish(sender, target);
        return true;
    }

    private void toggleVanish(CommandSender sender, Player target) {
        boolean isVanished = !target.isInvisible();
        target.setInvisible(isVanished);

        String status = isVanished ? "&aenabled." : "&cdisabled.";
        
        // Message to the target
        if (sender != target) {
            target.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Your vanish mode has been " + status));
        }
        
        // Message to the sender
        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Vanish mode has been " + status));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Vanish mode for " + Constants.PRIMARY + target.getName() + " &7has been " + status));
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