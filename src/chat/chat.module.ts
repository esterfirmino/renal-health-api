import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatMessage } from "./chat-message.entity";
import { Summary } from "../summary/summary.entity";
import { Project } from "../project/project.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatMessage, Summary, Project])
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService]
})
export class ChatModule {}
