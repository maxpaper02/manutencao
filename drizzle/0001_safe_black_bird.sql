CREATE TABLE `serviceOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sector` varchar(255) NOT NULL,
	`problemType` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('Baixa','Média','Alta','Crítica') NOT NULL,
	`status` enum('Aberta','Em Andamento','Concluída') NOT NULL DEFAULT 'Aberta',
	`requesterName` varchar(255) NOT NULL,
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`previousStatus` enum('Aberta','Em Andamento','Concluída'),
	`newStatus` enum('Aberta','Em Andamento','Concluída') NOT NULL,
	`changedBy` int,
	`notes` text,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `statusHistory_id` PRIMARY KEY(`id`)
);
