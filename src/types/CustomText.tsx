//@ts-nocheck
interface CustomTextProps {
	children?: React.ReactNode;
	color?: string;
	className?: any;
	onClick?: () => void;
	style?: any;
	id?: any;
	type?:
		| 'H1'
		| 'H2'
		| 'H3'
		| 'H6'
        | 'H1-SIM'
		| 'Title'
		| 'Subtitle'
		| 'Body'
		| 'Caption'
		| 'CaptionBold'
		| 'Micro'
		| 'Body2'
		| 'BodyLarge'
		| 'MicroBold'
		| '';
}

const CustomText = ({ children, style, color, type, className, onClick, id, ...rest }: CustomTextProps) => {
	let customStyle;

	switch (type) {
		case 'H1':
			customStyle = { fontSize: '20px', fontWeight: 'bold' };
			break;
		case 'H1-SIM':
			customStyle = { fontSize: '20px', fontWeight: 'normal' };
			break;
		case 'H2':
			customStyle = { fontSize: '18px', fontWeight: 'bold' };
			break;
		case 'H3':
			customStyle = { fontSize: '16px', fontWeight: 'bold' };
			break;
		case 'H6':
			customStyle = { fontSize: '16px', fontWeight: 'bold' };
			break;
		case 'Title':
			customStyle = { fontSize: '16px', fontWeight: 'normal' };
			break;
		case 'Subtitle':
			customStyle = { fontSize: '14px', fontWeight: 'bold' };
			break;
		case 'Body':
			customStyle = { fontSize: '14px', fontWeight: 'normal' };
			break;
		case 'Body2':
			customStyle = { fontSize: '14px', fontWeight: '500' };
			break;
		case 'Caption':
			customStyle = { fontSize: '12px', fontWeight: 'normal' };
			break;
		case 'CaptionBold':
			customStyle = { fontSize: '12px', fontWeight: 700 };
			break;
		case 'Micro':
			customStyle = { fontSize: '10px', fontWeight: 'normal' };
			break;
		case 'MicroBold':
			customStyle = { fontSize: '10px', fontWeight: '500' };
			break;
		case 'BodyLarge':
			customStyle = { fontSize: '24px', fontWeight: 500 };
			break;
		default:
			customStyle = {};
			break;
	}

	return (
		<p
			onClick={onClick}
			className={className}
			style={{
				color: color ? color : style.color,
				...customStyle,
				...style,
			}}
			id={id}
			{...rest}>
			{children}
		</p>
	);
};

CustomText.defaultProps = {
	color: 'black',
	children: '',
};
export default CustomText;
