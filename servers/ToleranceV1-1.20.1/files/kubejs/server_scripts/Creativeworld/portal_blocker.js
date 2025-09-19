// priority: 15

// Block portal creation in creative dimension
BlockEvents.placed(event => {
  let { player, block } = event;
  if (!player) return;
  if (player.level.dimension.toString() !== "tolerance:creatif") return;

  if (block.id === "minecraft:end_portal_frame") {
    player.tell("§cYou cannot place end portal frames in the Creative World!");
    event.cancel();
    return;
  }

  if (block.id.includes("portal") || block.id.includes("gateway")) {
    player.tell("§cYou cannot place portal blocks in the Creative World!");
    event.cancel();
    return;
  }
});

BlockEvents.rightClicked(event => {
  let { player, block } = event;
  if (!player) return;
  if (player.level.dimension.toString() !== "tolerance:creatif") return;
  let item = event.item;

  if (item.id === "minecraft:flint_and_steel" || item.id === "minecraft:fire_charge") {
    if (block.id === "minecraft:obsidian") {
      player.tell("§cYou cannot ignite portals in the Creative World!");
      event.cancel();
      return;
    }
  }

  if (item.id === "minecraft:enderpearl") {
    if (block.id === "minecraft:end_portal_frame") {
      player.tell("§cYou cannot ignite portals in the Creative World!");
      event.cancel();
      return;
    }
  }
});