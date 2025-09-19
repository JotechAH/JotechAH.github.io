// Optional: list of specific blocks to always block
let blockedBlocks = [
	"minecraft:ender_chest",
	"apotheosis:augmenting_table",
	"apotheosis:simple_reforging_table",
	"apotheosis:reforging_table",
	"createendertransmission:chunk_loader",
	"createendertransmission:energy_transmitter",
	"createendertransmission:item_transmitter",
	"createendertransmission:fluid_transmitter"
];

// Function to check if a block has an inventory (tile entity with items)
function isContainerBlock(block) {
	let blockEntityType = block.blockEntityType;
	return blockEntityType != null && blockEntityType.hasInventory;
}

// Check if a block should be blocked
function shouldBlockBlock(block) {
	return blockedBlocks.includes(block.id) || isContainerBlock(block);
}

// Block right-click (interaction)
BlockEvents.rightClicked(event => {
	let { player, block } = event;
	if (!player) return;
	if (player.level.dimension.toString() !== "tolerance:creatif") return;

	if (shouldBlockBlock(block)) {
		player.tell("§cYou cannot interact with container blocks in the Creative World!");
		event.cancel();
	}
});

// Block placement
BlockEvents.placed(event => {
	let { player, block } = event;
	if (!player) return;
	if (player.level.dimension.toString() !== "tolerance:creatif") return;

	if (shouldBlockBlock(block)) {
		player.tell("§cYou cannot place container blocks in the Creative World!");
		event.cancel();
	}
});
