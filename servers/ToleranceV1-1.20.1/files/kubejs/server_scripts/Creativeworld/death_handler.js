// priority: 25

// Handle potentially fatal damage in creative dimension
EntityEvents.hurt(event => {
  let entity = event.entity;
  if (!entity || !entity.isPlayer()) return;
  
  let player = entity;
  
  // Check if damage occurred in creative dimension
  if (player.level.dimension.toString() === "tolerance:creatif") {
    event.cancel();
  }
});

// Additional safety: Monitor for players in creative dimension and ensure they have the right gamemode
ServerEvents.tick(event => {
  // Only check every 20 ticks (1 second) to avoid performance issues
  if (event.server.tickCount % 20 !== 0) return;
  
  // Check all players in creative dimension
  event.server.players.forEach(player => {
    if (player.level.dimension.toString() === "tolerance:creatif") {
      // Ensure player is in creative mode
      if (player.gameMode.name !== "creative") {
        player.setGameMode("creative");
      }
      
      if (player.y < -62) {
        player.teleportTo("tolerance:creatif", player.x, 100.0, player.z, player.yaw, player.pitch);
        player.tell("§eSaved you from the void! Teleported back to safe height.");
      }
    }
  });
});