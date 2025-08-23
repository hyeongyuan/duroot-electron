interface AvatarProps {
	size: number;
	imageUrl: string;
	alt?: string;
}

export function Avatar({ size, imageUrl, alt }: AvatarProps) {
	return (
		<img
			style={{
				width: `${size}px`,
				height: `${size}px`,
			}}
			className="rounded-full"
			src={imageUrl}
			alt={alt || "Avatar"}
		/>
	);
}
