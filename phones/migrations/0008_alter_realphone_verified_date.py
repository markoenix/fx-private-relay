# Generated by Django 3.2.13 on 2022-05-29 15:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("phones", "0007_alter_realphone_verified_date"),
    ]

    operations = [
        migrations.AlterField(
            model_name="realphone",
            name="verified_date",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
