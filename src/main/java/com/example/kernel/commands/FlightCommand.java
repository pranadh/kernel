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

public class FlightCommand implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            if (!(sender instanceof Player)) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/fly <player>"));
                return true;
            }
            
            Player player = (Player) sender;
            toggleFlight(sender, player);
            return true;
        }

        Player target = Bukkit.getPlayer(args[0]);
        if (target == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + args[0]));
            return true;
        }

        toggleFlight(sender, target);
        return true;
    }

    private void toggleFlight(CommandSender sender, Player target) {
        boolean canFly = !target.getAllowFlight();
        target.setAllowFlight(canFly);
        if (!canFly) {
            target.setFlying(false);
        }

        String status = canFly ? "&aenabled" : "&cdisabled";
        
        // Message to the target
        if (sender != target) {
            target.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Your flight mode has been " + status + "&7."));
        }
        
        // Message to the sender
        if (sender == target) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Flight mode has been " + status + "&7."));
        } else {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Flight mode for " + Constants.PRIMARY + target.getName() + 
                " &7has been " + status + "&7."));
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