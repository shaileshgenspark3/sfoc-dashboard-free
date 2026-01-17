import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import Participant from '../models/Participant.js';
import Activity from '../models/Activity.js';
import Group from '../models/Group.js';
import ChatMessage from '../models/Message.js';
import ChatRoom from '../models/ChatRoom.js';
import Settings from '../models/Settings.js';

class BackupJob {
    private static readonly BACKUP_DIR = path.join(process.cwd(), 'backups');

    static start(): void {
        // Run at 00:05 (12:05 AM) daily
        cron.schedule('5 0 * * *', async () => {
            console.log('💾 Starting Daily Data Backup...');
            await this.performBackup();
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });

        console.log('✅ Backup cron job started - will run daily at 00:05');
    }

    static async performBackup() {
        try {
            const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const backupPath = path.join(this.BACKUP_DIR, timestamp);

            // Ensure backup directory exists
            await fs.mkdir(backupPath, { recursive: true });

            // Define collections to backup
            const collections = [
                { name: 'participants', model: Participant },
                { name: 'activities', model: Activity },
                { name: 'groups', model: Group },
                { name: 'messages', model: ChatMessage },
                { name: 'chatrooms', model: ChatRoom },
                { name: 'settings', model: Settings }
            ];

            for (const { name, model } of collections) {
                console.log(`📦 Backing up ${name}...`);
                const data = await model.find({});
                const filePath = path.join(backupPath, `${name}.json`);

                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                console.log(`   ✅ Saved ${data.length} records to ${filePath}`);
            }

            console.log(`✨ Backup completed successfully at ${backupPath}`);
            return { success: true, path: backupPath };

        } catch (error) {
            console.error('❌ Data Backup Failed:', error);
            return { success: false, error };
        }
    }
}

export default BackupJob;
