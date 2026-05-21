import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`nom\` text NOT NULL,
  	\`role\` text DEFAULT 'redacteur' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`caption\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_large_url\` text,
  	\`sizes_large_width\` numeric,
  	\`sizes_large_height\` numeric,
  	\`sizes_large_mime_type\` text,
  	\`sizes_large_filesize\` numeric,
  	\`sizes_large_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_large_sizes_large_filename_idx\` ON \`media\` (\`sizes_large_filename\`);`)
  await db.run(sql`CREATE TABLE \`danses\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titre\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`niveau_id\` integer NOT NULL,
  	\`annee_saison_id\` integer NOT NULL,
  	\`video_demo_url\` text,
  	\`video_apprentissage_url\` text,
  	\`fiche_pdf_id\` integer,
  	\`description\` text,
  	\`date_creation\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`niveau_id\`) REFERENCES \`niveaux\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`annee_saison_id\`) REFERENCES \`saisons\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`fiche_pdf_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`danses_slug_idx\` ON \`danses\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`danses_niveau_idx\` ON \`danses\` (\`niveau_id\`);`)
  await db.run(sql`CREATE INDEX \`danses_annee_saison_idx\` ON \`danses\` (\`annee_saison_id\`);`)
  await db.run(sql`CREATE INDEX \`danses_fiche_pdf_idx\` ON \`danses\` (\`fiche_pdf_id\`);`)
  await db.run(sql`CREATE INDEX \`danses_updated_at_idx\` ON \`danses\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`danses_created_at_idx\` ON \`danses\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`niveaux\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`nom\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`ordre\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`niveaux_nom_idx\` ON \`niveaux\` (\`nom\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`niveaux_slug_idx\` ON \`niveaux\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`niveaux_updated_at_idx\` ON \`niveaux\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`niveaux_created_at_idx\` ON \`niveaux\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`saisons\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`libelle\` text NOT NULL,
  	\`annee_debut\` numeric NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`saisons_libelle_idx\` ON \`saisons\` (\`libelle\`);`)
  await db.run(sql`CREATE INDEX \`saisons_updated_at_idx\` ON \`saisons\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`saisons_created_at_idx\` ON \`saisons\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`albums_medias\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`fichier_id\` integer NOT NULL,
  	\`legende\` text,
  	FOREIGN KEY (\`fichier_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`albums_medias_order_idx\` ON \`albums_medias\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`albums_medias_parent_id_idx\` ON \`albums_medias\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_medias_fichier_idx\` ON \`albums_medias\` (\`fichier_id\`);`)
  await db.run(sql`CREATE TABLE \`albums\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titre_album\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`categorie_id\` integer NOT NULL,
  	\`date_evenement\` text NOT NULL,
  	\`description\` text,
  	\`couverture_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`categorie_id\`) REFERENCES \`categories_albums\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`couverture_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`albums_slug_idx\` ON \`albums\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`albums_categorie_idx\` ON \`albums\` (\`categorie_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_couverture_idx\` ON \`albums\` (\`couverture_id\`);`)
  await db.run(sql`CREATE INDEX \`albums_updated_at_idx\` ON \`albums\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`albums_created_at_idx\` ON \`albums\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`categories_albums\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`nom\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_albums_nom_idx\` ON \`categories_albums\` (\`nom\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_albums_slug_idx\` ON \`categories_albums\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`categories_albums_updated_at_idx\` ON \`categories_albums\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`categories_albums_created_at_idx\` ON \`categories_albums\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`articles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titre\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`image_une_id\` integer,
  	\`extrait\` text,
  	\`contenu\` text,
  	\`statut\` text DEFAULT 'brouillon' NOT NULL,
  	\`date_publication\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_une_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`articles_slug_idx\` ON \`articles\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`articles_image_une_idx\` ON \`articles\` (\`image_une_id\`);`)
  await db.run(sql`CREATE INDEX \`articles_updated_at_idx\` ON \`articles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`articles_created_at_idx\` ON \`articles\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`danses_id\` integer,
  	\`niveaux_id\` integer,
  	\`saisons_id\` integer,
  	\`albums_id\` integer,
  	\`categories_albums_id\` integer,
  	\`articles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`danses_id\`) REFERENCES \`danses\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`niveaux_id\`) REFERENCES \`niveaux\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`saisons_id\`) REFERENCES \`saisons\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`albums_id\`) REFERENCES \`albums\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_albums_id\`) REFERENCES \`categories_albums\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`articles_id\`) REFERENCES \`articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_danses_id_idx\` ON \`payload_locked_documents_rels\` (\`danses_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_niveaux_id_idx\` ON \`payload_locked_documents_rels\` (\`niveaux_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_saisons_id_idx\` ON \`payload_locked_documents_rels\` (\`saisons_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_albums_id_idx\` ON \`payload_locked_documents_rels\` (\`albums_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_albums_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_albums_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_articles_id_idx\` ON \`payload_locked_documents_rels\` (\`articles_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`banniere_galerie_membres\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`photo_id\` integer NOT NULL,
  	\`legende\` text,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`banniere\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`banniere_galerie_membres_order_idx\` ON \`banniere_galerie_membres\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`banniere_galerie_membres_parent_id_idx\` ON \`banniere_galerie_membres\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`banniere_galerie_membres_photo_idx\` ON \`banniere_galerie_membres\` (\`photo_id\`);`)
  await db.run(sql`CREATE TABLE \`banniere\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`titre\` text DEFAULT 'Memphis Country Club' NOT NULL,
  	\`sous_titre\` text DEFAULT 'Association de danse country à Villeneuve-d’Ascq — Cours, démos, événements toute l’année.',
  	\`cta_texte\` text DEFAULT 'Voir les danses',
  	\`cta_lien\` text DEFAULT '/danses',
  	\`cta_secondaire_texte\` text DEFAULT 'Se rendre aux cours',
  	\`cta_secondaire_lien\` text DEFAULT '/acces',
  	\`image_id\` integer,
  	\`image_alt\` text DEFAULT 'Les membres du Memphis Country Club',
  	\`style\` text DEFAULT 'cote-a-cote',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`banniere_image_idx\` ON \`banniere\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`contact\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`email\` text DEFAULT 'memphiscountryclub59650@gmail.com' NOT NULL,
  	\`telephone\` text DEFAULT '07 69 21 08 91' NOT NULL,
  	\`adresse\` text DEFAULT 'Salle Alfred Dequesnes, 37 Rue Jean Baptiste Bonte, 59650 Villeneuve-d’Ascq' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`horaires_cours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`niveau\` text NOT NULL,
  	\`jour\` text NOT NULL,
  	\`horaire\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`horaires\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`horaires_cours_order_idx\` ON \`horaires_cours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`horaires_cours_parent_id_idx\` ON \`horaires_cours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`horaires_transports\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`mode\` text NOT NULL,
  	\`detail\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`horaires\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`horaires_transports_order_idx\` ON \`horaires_transports\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`horaires_transports_parent_id_idx\` ON \`horaires_transports\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`horaires\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`danses\`;`)
  await db.run(sql`DROP TABLE \`niveaux\`;`)
  await db.run(sql`DROP TABLE \`saisons\`;`)
  await db.run(sql`DROP TABLE \`albums_medias\`;`)
  await db.run(sql`DROP TABLE \`albums\`;`)
  await db.run(sql`DROP TABLE \`categories_albums\`;`)
  await db.run(sql`DROP TABLE \`articles\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`banniere_galerie_membres\`;`)
  await db.run(sql`DROP TABLE \`banniere\`;`)
  await db.run(sql`DROP TABLE \`contact\`;`)
  await db.run(sql`DROP TABLE \`horaires_cours\`;`)
  await db.run(sql`DROP TABLE \`horaires_transports\`;`)
  await db.run(sql`DROP TABLE \`horaires\`;`)
}
