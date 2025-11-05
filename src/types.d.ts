// src/types.d.ts

interface ArticleDevto {
	id: string; // ID unik artikel
	title: string; // Judul artikel
	description: string; // Deskripsi singkat artikel
	body_html: string; // Isi artikel dalam format HTML
	body_markdown: string; // Isi artikel dalam format markdown
	published_at: string; // Tanggal publikasi artikel
	updated_at: string; // Tanggal terakhir kali diperbarui
	slug: string; // Slug artikel (URL-friendly version of the title)
	tags: string[]; // Tag terkait artikel
	reading_time: number; // Waktu yang dibutuhkan untuk membaca artikel (dalam menit)
	cover_image?: string; // Gambar sampul artikel (opsional)
	canonical_url?: string; // URL kanonis artikel (opsional)
	comments_count: number; // Jumlah komentar artikel
	positive_reactions_count: number; // Jumlah reaksi positif (like/upvote)
	social_image: string; // Gambar yang digunakan untuk dibagikan di media sosial
	author: Author; // Penulis artikel
	organization?: string; // Nama organisasi yang mempublikasikan artikel (opsional)
}

interface Author {
	id: string; // ID unik penulis
	username: string; // Nama pengguna penulis
	name: string; // Nama lengkap penulis
	profile_image: string; // URL gambar profil penulis
	bio: string; // Biografi penulis
	twitter_username?: string; // Username Twitter penulis (opsional)
	github_username?: string; // Username GitHub penulis (opsional)
}

interface Http<T = unknown, E = Error> {
	data?: T;
	error?: E | Error;
	message: string;
	status: number;
}

interface MetaDoc {
	id: string;
	name: string;
	mimeType: string;
	modifiedTime: string;
}
