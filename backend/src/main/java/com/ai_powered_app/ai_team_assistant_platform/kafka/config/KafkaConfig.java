package com.ai_powered_app.ai_team_assistant_platform.kafka.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import com.ai_powered_app.ai_team_assistant_platform.kafka.topic.KafkaTopics;

import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConfig {

    private final KafkaProperties kafkaProperties;

    public KafkaConfig(KafkaProperties kafkaProperties) {
        this.kafkaProperties = kafkaProperties;
    }

    // =========================================================
    // Kafka Admin
    // =========================================================

    @Bean
    public KafkaAdmin kafkaAdmin() {
        return new KafkaAdmin(
                kafkaProperties.buildAdminProperties(null)
        );
    }

    // =========================================================
    // Topics
    // =========================================================

    @Bean
    public NewTopic ticketCreatedTopic() {
        return TopicBuilder
                .name(KafkaTopics.TICKET_CREATED)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic documentUploadedTopic() {
        return TopicBuilder
                .name(KafkaTopics.DOCUMENT_UPLOADED)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic passwordResetEmailTopic() {
        return TopicBuilder
                .name(KafkaTopics.PASSWORD_RESET_EMAIL)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic passwordResetSuccessEmailTopic() {
        return TopicBuilder
                .name(KafkaTopics.PASSWORD_RESET_SUCCESS_EMAIL)
                .partitions(1)
                .replicas(1)
                .build();
    }

    // =========================================================
    // Producer
    // =========================================================

    @Bean
    public ProducerFactory<String, Object> producerFactory() {

        Map<String, Object> config =
                kafkaProperties.buildProducerProperties(null);

        config.put(
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                StringSerializer.class
        );

        config.put(
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                JsonSerializer.class
        );

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    // =========================================================
    // Consumer
    // =========================================================

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {

        Map<String, Object> config =
                kafkaProperties.buildConsumerProperties(null);

        config.put(
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class
        );

        config.put(
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                JsonDeserializer.class
        );

        config.put(
                JsonDeserializer.TRUSTED_PACKAGES,
                "com.ai_powered_app.ai_team_assistant_platform.kafka.event"
        );

        return new DefaultKafkaConsumerFactory<>(config);
    }

    // =========================================================
    // Listener Factory
    // =========================================================

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object>
    concurrentKafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(consumerFactory());

        return factory;
    }
}