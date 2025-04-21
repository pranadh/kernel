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

public class ListCommand implements CommandExecutor, TabCompleter {

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        Player player = sender instanceof Player ? (Player) sender : null;
        
        String listMessage = String.join("\n",
            "&8&m                                                &r",
            "&7Online Players: " + Constants.PRIMARY + "%server_online%&7/&f%server_max_players%",
            "",
            "&7Staff Online (%playerlist_staff_amount%):",
            Constants.PRIMARY + "%playerlist_staff_list%",
            "",
            "&7Players Online (%playerlist_players_amount%):",
            Constants.PRIMARY + "%playerlist_players_list%",
            "&8&m                                                &r"
        );

        String formattedMessage = PlaceholderAPI.setPlaceholders(player, listMessage);
        sender.sendMessage(ColorUtils.translateColorCodes(formattedMessage));
        
        return true;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        return new ArrayList<>();
    }
}