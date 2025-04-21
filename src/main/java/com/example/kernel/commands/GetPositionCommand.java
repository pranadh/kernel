package com.example.kernel.commands;

import me.clip.placeholderapi.PlaceholderAPI;
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

public class GetPositionCommand implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        Player target;

        if (args.length > 0) {
            target = Bukkit.getPlayer(args[0]);
            if (target == null) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Player not found: " + Constants.PRIMARY + args[0]));
                return true;
            }
        } else {
            if (!(sender instanceof Player)) {
                sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/getpos <player>"));
                return true;
            }
            target = (Player) sender;
        }

        showPosition(sender, target);
        return true;
    }

    private void showPosition(CommandSender sender, Player target) {
        String posInfo = String.join("\n",
            "&8&m                                                &r",
            "&7Location of: " + Constants.PRIMARY + "%player_name%",
            "",
            "&7World: " + Constants.PRIMARY + "%player_world%",
            "&7X: " + Constants.PRIMARY + "%player_x%",
            "&7Y: " + Constants.PRIMARY + "%player_y%",
            "&7Z: " + Constants.PRIMARY + "%player_z%",
            "&7Player First Join: " + Constants.PRIMARY + "%player_first_join_date%",
            "&7Player Last Join: " + Constants.PRIMARY + "%player_last_join_date%",
            "&8&m                                                &r"
        );

        String formattedInfo = PlaceholderAPI.setPlaceholders(target, posInfo);
        sender.sendMessage(ColorUtils.translateColorCodes(formattedInfo));
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