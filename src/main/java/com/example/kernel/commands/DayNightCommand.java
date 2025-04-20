package com.example.kernel.commands;

import org.bukkit.World;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;

import com.example.kernel.utils.ColorUtils;
import com.example.kernel.utils.Constants;

import java.util.ArrayList;
import java.util.List;

public class DayNightCommand implements CommandExecutor, TabCompleter {
    private static final long DAY_TIME = 1000L;
    private static final long NIGHT_TIME = 13000L;

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        Player player = (Player) sender;
        World world = player.getWorld();

        if (command.getName().equalsIgnoreCase("day")) {
            world.setTime(DAY_TIME);
            player.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set time to &eday."));
            return true;
        }

        if (command.getName().equalsIgnoreCase("night")) {
            world.setTime(NIGHT_TIME);
            player.sendMessage(ColorUtils.translateColorCodes(Constants.PREFIX + "&7Set time to &9night."));
            return true;
        }

        return false;
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        return new ArrayList<>();
    }
}