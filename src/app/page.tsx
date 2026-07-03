import { Container, Stack, Text, Title } from '@mantine/core';

export default function Home() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="xs">
        <Title order={1}>FischerTest</Title>
        <Text c="dimmed">Технический каркас приложения готов.</Text>
      </Stack>
    </Container>
  );
}
