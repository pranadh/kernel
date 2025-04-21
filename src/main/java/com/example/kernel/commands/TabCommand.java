package com.example.kernel.commands;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import com.example.kernel.Kernel;
import com.example.kernel.managers.TabManager;
import com.example.kernel.utils.ColorUtils;
import com.example.kernel.utils.Constants;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class TabCommand implements CommandExecutor, TabCompleter {

    private final Kernel plugin;

    public TabCommand(Kernel plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0 || !args[0].equalsIgnoreCase("reload")) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Usage: " + Constants.PRIMARY + "/tab reload"));
            return true;
        }

        TabManager tabManager = plugin.getTabManager();
        if (tabManager == null) {
            sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Tab manager not initialized!"));
            return true;
        }

        // Refresh tab for all online players
        for (Player player : Bukkit.getOnlinePlayers()) {
            tabManager.removePlayer(player);
            tabManager.updatePlayerTab(player);
        }

        sender.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Tab display has been " + Constants.PRIMARY + "refreshed&7."));
        return true;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (args.length == 1) {
            return Arrays.asList("reload").stream()
                    .filter(s -> s.toLowerCase().startsWith(args[0].toLowerCase()))
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
}