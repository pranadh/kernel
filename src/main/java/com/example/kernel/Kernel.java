package com.example.kernel;

import org.bukkit.plugin.java.JavaPlugin;
import net.luckperms.api.LuckPerms;

import org.bukkit.Bukkit;
import org.bukkit.plugin.RegisteredServiceProvider;

import com.example.kernel.commands.*;
import com.example.kernel.listeners.*;

import com.example.kernel.managers.TabManager;

public class Kernel extends JavaPlugin {
    private LuckPerms luckPerms;
    private TabManager tabManager;

    public TabManager getTabManager() {
        return tabManager;
    }

    @Override
    public void onEnable() {

        // Setup LuckPerms integration
        RegisteredServiceProvider<LuckPerms> provider = getServer().getServicesManager()
                .getRegistration(LuckPerms.class);
        if (provider != null) {
            luckPerms = provider.getProvider();

            // Initialize TabManager with server's scoreboard
            tabManager = new TabManager(luckPerms, Bukkit.getScoreboardManager().getMainScoreboard());
            getServer().getPluginManager().registerEvents(tabManager, this);
            
            // Update tab list for online players (in case of reload)
            Bukkit.getOnlinePlayers().forEach(player -> tabManager.updatePlayerTab(player));
        }

        // Register commands
        BroadcastCommand broadcastCommand = new BroadcastCommand();
        this.getCommand("broadcast").setExecutor(broadcastCommand);
        this.getCommand("broadcast").setTabCompleter(broadcastCommand);

        PlaytimeCommand playtimeCommand = new PlaytimeCommand();
        this.getCommand("playtime").setExecutor(playtimeCommand);
        this.getCommand("playtime").setTabCompleter(playtimeCommand);

        VanishCommand vanishCommand = new VanishCommand();
        this.getCommand("vanish").setExecutor(vanishCommand);
        this.getCommand("vanish").setTabCompleter(vanishCommand);

        GodCommand godCommand = new GodCommand();
        this.getCommand("god").setExecutor(godCommand);
        this.getCommand("god").setTabCompleter(godCommand);

        ScaleCommand scaleCommand = new ScaleCommand();
        this.getCommand("scale").setExecutor(scaleCommand);
        this.getCommand("scale").setTabCompleter(scaleCommand);

        DayNightCommand dayNightCommand = new DayNightCommand();
        this.getCommand("day").setExecutor(dayNightCommand);
        this.getCommand("night").setExecutor(dayNightCommand);

        ClearDropsCommand clearDropsCommand = new ClearDropsCommand();
        this.getCommand("cleardrops").setExecutor(clearDropsCommand);
        this.getCommand("cleardrops").setTabCompleter(clearDropsCommand);

        ChatControlCommands chatControl = new ChatControlCommands();
        this.getCommand("chat").setExecutor(chatControl);
        this.getCommand("chat").setTabCompleter(chatControl);

        RankCommand rankCommand = new RankCommand(luckPerms);
        this.getCommand("rank").setExecutor(rankCommand);
        this.getCommand("rank").setTabCompleter(rankCommand);
        
        GamemodeCommand gamemodeCommand = new GamemodeCommand();
        this.getCommand("gm").setExecutor(gamemodeCommand);
        this.getCommand("gmc").setExecutor(gamemodeCommand);
        this.getCommand("gms").setExecutor(gamemodeCommand);
        this.getCommand("gmsp").setExecutor(gamemodeCommand);
        this.getCommand("gma").setExecutor(gamemodeCommand);

        this.getCommand("gm").setTabCompleter(gamemodeCommand);
        this.getCommand("gmc").setTabCompleter(gamemodeCommand);
        this.getCommand("gms").setTabCompleter(gamemodeCommand);
        this.getCommand("gmsp").setTabCompleter(gamemodeCommand);
        this.getCommand("gma").setTabCompleter(gamemodeCommand);

        FeedHealCommands feedHealCommands = new FeedHealCommands();
        this.getCommand("feed").setExecutor(feedHealCommands);
        this.getCommand("feed").setTabCompleter(feedHealCommands);
        this.getCommand("heal").setExecutor(feedHealCommands);
        this.getCommand("heal").setTabCompleter(feedHealCommands);

        SpeedCommand speedCommand = new SpeedCommand();
        this.getCommand("speed").setExecutor(speedCommand);
        this.getCommand("speed").setTabCompleter(speedCommand);

        MetricsCommand metricsCommand = new MetricsCommand();
        this.getCommand("metrics").setExecutor(metricsCommand);
        this.getCommand("metrics").setTabCompleter(metricsCommand);

        ListCommand listCommand = new ListCommand();
        this.getCommand("list").setExecutor(listCommand);
        this.getCommand("list").setTabCompleter(listCommand);

        GetPositionCommand getPositionCommand = new GetPositionCommand();
        this.getCommand("getpos").setExecutor(getPositionCommand);
        this.getCommand("getpos").setTabCompleter(getPositionCommand);
        
        // Register listeners
        getServer().getPluginManager().registerEvents(new ChatListener(chatControl, luckPerms), this);
        getServer().getPluginManager().registerEvents(new PlayerJoinLeave(), this);
        getServer().getPluginManager().registerEvents(new MOTDListener(), this);
    }

    @Override
    public void onDisable() {

        if (tabManager != null) {
            // Clean up teams on disable
            Bukkit.getOnlinePlayers().forEach(player -> tabManager.removePlayer(player));
        }

        getLogger().info("Kernel disabled!");
    }
}